import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import InterviewSlot from "@/models/InterviewSlot";
import { isClubApplicationOpen } from "@/lib/clubSettings";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [applicationOpen, slots] = await Promise.all([
      isClubApplicationOpen(),
      (async () => {
        await dbConnect();
        return InterviewSlot.find().sort({ date: 1, startTime: 1 }).lean();
      })(),
    ]);

    const mapped = slots.map((s) => ({
      _id: s._id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      capacity: s.capacity,
      bookedCount: s.bookings?.length ?? 0,
      isFull: (s.bookings?.length ?? 0) >= s.capacity,
    }));

    return NextResponse.json({ applicationOpen, slots: mapped });
  } catch (error) {
    console.error("Get slots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
