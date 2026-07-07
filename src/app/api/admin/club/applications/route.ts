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
