import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import ClubApplication from "@/models/ClubApplication";
import InterviewSlot from "@/models/InterviewSlot";

async function getCallerRole(email: string) {
  const db = (await clientPromise).db();
  const user = await db.collection("users").findOne({ email });
  return user?.role || "user";
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = await getCallerRole(session.user.email);
    if (role !== "admin" && role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const applications = await ClubApplication.find().sort({ createdAt: -1 }).lean();

    const slotIds = applications
      .filter((a) => a.interviewSlotId)
      .map((a) => a.interviewSlotId!);
    const slots = slotIds.length > 0
      ? await InterviewSlot.find({ _id: { $in: slotIds } }).lean()
      : [];
    const slotMap = new Map(slots.map((s) => [s._id.toString(), s]));

    const result = applications.map((a) => ({
      ...a,
      interviewSlot: a.interviewSlotId ? slotMap.get(a.interviewSlotId.toString()) ?? null : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin get club applications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = await getCallerRole(session.user.email);
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, slotId } = await req.json();
    if (!id || !slotId) {
      return NextResponse.json({ error: "Missing id or slotId" }, { status: 400 });
    }

    await dbConnect();
    const app = await ClubApplication.findById(id);
    if (!app) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (app.interviewSlotId?.toString() === slotId) {
      return NextResponse.json({ error: "อยู่ในรอบนี้อยู่แล้ว" }, { status: 400 });
    }

    const reserved = await InterviewSlot.findOneAndUpdate(
      { _id: slotId, $expr: { $lt: [{ $size: "$bookings" }, "$capacity"] } },
      { $push: { bookings: { applicationId: app._id, email: app.email } } },
      { new: true }
    );
    if (!reserved) {
      return NextResponse.json({ error: "รอบเวลานี้เต็มแล้ว" }, { status: 409 });
    }

    try {
      if (app.interviewSlotId) {
        await InterviewSlot.findByIdAndUpdate(app.interviewSlotId, {
          $pull: { bookings: { applicationId: app._id } },
        });
      }
      await ClubApplication.findByIdAndUpdate(app._id, {
        $set: { interviewSlotId: reserved._id },
      });
    } catch (updateError) {
      // Roll back the new reservation so the applicant doesn't end up double-booked
      await InterviewSlot.findByIdAndUpdate(reserved._id, {
        $pull: { bookings: { applicationId: app._id } },
      });
      throw updateError;
    }

    return NextResponse.json({
      message: "ย้ายรอบสัมภาษณ์แล้ว",
      slot: { _id: reserved._id, date: reserved.date, startTime: reserved.startTime, endTime: reserved.endTime },
    });
  } catch (error) {
    console.error("Admin move club application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = await getCallerRole(session.user.email);
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await dbConnect();
    const app = await ClubApplication.findById(id);
    if (!app) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (app.interviewSlotId) {
      await InterviewSlot.findByIdAndUpdate(app.interviewSlotId, {
        $pull: { bookings: { applicationId: app._id } },
      });
    }

    await ClubApplication.findByIdAndDelete(id);
    return NextResponse.json({ message: "ลบแล้ว" });
  } catch (error) {
    console.error("Admin delete club application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
