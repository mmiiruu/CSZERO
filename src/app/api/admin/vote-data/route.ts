import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import Vote from "@/models/Vote";
import User from "@/models/User";
import CandidateApplication from "@/models/CandidateApplication";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = (await clientPromise).db();
    const dbUser = await db.collection("users").findOne({ email: session.user.email });
    if (dbUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const [votes] = await Promise.all([
      Vote.deleteMany({}),
      User.updateMany({ hasVoted: true }, { $set: { hasVoted: false } }),
      CandidateApplication.updateMany({}, { $set: { voteCount: 0 } }),
    ]);

    return NextResponse.json({
      message: "Vote data cleared",
      votesDeleted: votes.deletedCount,
    });
  } catch (error) {
    console.error("Clear vote data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
