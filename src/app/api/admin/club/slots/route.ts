import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import InterviewSlot from "@/models/InterviewSlot";
import ClubApplication from "@/models/ClubApplication";

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
    const slots = await InterviewSlot.find().sort({ date: 1, startTime: 1 }).lean();
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Admin get slots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = await getCallerRole(session.user.email);
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { date, slots, capacity } = await req.json();
    if (!date || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: "Missing date or slots" }, { status: 400 });
    }
    const slotCapacity = Number.isInteger(capacity) && capacity > 0 ? capacity : 4;

    await dbConnect();
    const docs = slots.map((s: { startTime: string; endTime: string }) => ({
      date,
      startTime: s.startTime,
      endTime: s.endTime,
      capacity: slotCapacity,
    }));

    const result = await InterviewSlot.insertMany(docs, { ordered: false }).catch((err) => {
      if (err.code === 11000) return err.insertedDocs ?? [];
      throw err;
    });

    const count = Array.isArray(result) ? result.length : 0;
    return NextResponse.json({ message: `สร้าง ${count} slot แล้ว`, count }, { status: 201 });
  } catch (error) {
    console.error("Admin create slots error:", error);
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

    const { id, capacity } = await req.json();
    if (!id || !Number.isInteger(capacity) || capacity < 1) {
      return NextResponse.json({ error: "Missing id or invalid capacity" }, { status: 400 });
    }

    await dbConnect();
    const updated = await InterviewSlot.findOneAndUpdate(
      { _id: id, $expr: { $lte: [{ $size: "$bookings" }, capacity] } },
      { $set: { capacity } },
      { new: true }
    );
    if (!updated) {
      const slot = await InterviewSlot.findById(id).lean();
      if (!slot) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(
        { error: `ลด capacity ต่ำกว่าจำนวนที่จองแล้วไม่ได้ (จองแล้ว ${slot.bookings.length} คน)` },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: "อัปเดต capacity แล้ว", capacity });
  } catch (error) {
    console.error("Admin update slot capacity error:", error);
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

    const { id, date } = await req.json();
    await dbConnect();

    if (id) {
      await ClubApplication.updateMany({ interviewSlotId: id }, { $unset: { interviewSlotId: 1 } });
      await InterviewSlot.findByIdAndDelete(id);
      return NextResponse.json({ message: "ลบ slot แล้ว" });
    }
    if (date) {
      const slotIds = (await InterviewSlot.find({ date }).select("_id").lean()).map((s) => s._id);
      await ClubApplication.updateMany(
        { interviewSlotId: { $in: slotIds } },
        { $unset: { interviewSlotId: 1 } }
      );
      const result = await InterviewSlot.deleteMany({ date });
      return NextResponse.json({ message: `ลบ ${result.deletedCount} slot แล้ว` });
    }

    return NextResponse.json({ error: "Missing id or date" }, { status: 400 });
  } catch (error) {
    console.error("Admin delete slots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
