import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Vote from "@/models/Vote";
import User from "@/models/User";
import { CANDIDATES } from "@/config/candidates";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const db = (await clientPromise).db();
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    // Clear candidates, all votes, and reset every user's hasVoted flag
    // so everyone can vote again on the fresh set of candidates.
    await Candidate.deleteMany({});
    await Vote.deleteMany({});
    await User.updateMany({}, { $set: { hasVoted: false } });

    const inserted = await Candidate.insertMany(CANDIDATES);

    return NextResponse.json({
      message: `Seeded ${inserted.length} candidates and reset all votes`,
      count: inserted.length,
    });
  } catch (error) {
    console.error("Seed candidates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
