import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import InterviewSlot from "@/models/InterviewSlot";
import ClubApplication from "@/models/ClubApplication";

async function isBookingOpen() {
  const db = (await clientPromise).db();
  const doc = await db.collection("settings").findOne({ _id: "clubBooking" as unknown as never });
  return doc?.open === true;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [bookingOpen, slots] = await Promise.all([
      isBookingOpen(),
      (async () => {
        await dbConnect();
        return InterviewSlot.find().sort({ date: 1, startTime: 1 }).lean();
      })(),
    ]);

    const email = session.user.email;
    const mapped = slots.map((s) => ({
      _id: s._id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      isBooked: !!s.bookedBy,
      isMyBooking: s.bookedByEmail === email,
    }));

    return NextResponse.json({ bookingOpen, slots: mapped });
  } catch (error) {
    console.error("Get slots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isBookingOpen())) {
      return NextResponse.json({ error: "ยังไม่เปิดจองรอบสัมภาษณ์" }, { status: 403 });
    }

    const email = session.user.email.trim().toLowerCase();
    await dbConnect();

    const application = await ClubApplication.findOne({ email });
    if (!application) {
      return NextResponse.json({ error: "กรุณาสมัครชุมนุมก่อน" }, { status: 403 });
    }

    const alreadyBooked = await InterviewSlot.findOne({ bookedByEmail: email });
    if (alreadyBooked) {
      return NextResponse.json({ error: "คุณจองรอบสัมภาษณ์ไปแล้ว" }, { status: 409 });
    }

    const { slotId } = await req.json();
    if (!slotId) {
      return NextResponse.json({ error: "Missing slotId" }, { status: 400 });
    }

    const result = await InterviewSlot.findOneAndUpdate(
      { _id: slotId, bookedBy: null },
      { $set: { bookedBy: application._id, bookedByEmail: email } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ error: "รอบนี้ถูกจองไปแล้ว" }, { status: 409 });
    }

    await ClubApplication.findByIdAndUpdate(application._id, {
      $set: { interviewSlotId: result._id },
    });

    return NextResponse.json({ message: "จองสำเร็จ" });
  } catch (error) {
    console.error("Book slot error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isBookingOpen())) {
      return NextResponse.json({ error: "ยังไม่เปิดจองรอบสัมภาษณ์" }, { status: 403 });
    }

    const email = session.user.email.trim().toLowerCase();
    await dbConnect();

    const slot = await InterviewSlot.findOneAndUpdate(
      { bookedByEmail: email },
      { $unset: { bookedBy: 1, bookedByEmail: 1 } },
      { new: false }
    );

    if (!slot) {
      return NextResponse.json({ error: "ไม่พบรอบที่จองไว้" }, { status: 404 });
    }

    await ClubApplication.findByIdAndUpdate(slot.bookedBy, {
      $unset: { interviewSlotId: 1 },
    });

    return NextResponse.json({ message: "ยกเลิกการจองแล้ว" });
  } catch (error) {
    console.error("Cancel slot error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
