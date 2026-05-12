import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
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
    const [candidates, votes] = await Promise.all([
      Candidate.deleteMany({}),
      Vote.deleteMany({}),
    ]);

    // Reset hasVoted on all users so they can vote again after a fresh seeding.
    await User.updateMany({ hasVoted: true }, { $set: { hasVoted: false } });

    // Detach promoted flags on applications so admin can re-promote into a fresh list.
    await CandidateApplication.updateMany(
      { promoted: true },
      { $set: { promoted: false }, $unset: { promotedCandidateId: "" } }
    );

    return NextResponse.json({
      message: "Vote data cleared",
      candidatesDeleted: candidates.deletedCount,
      votesDeleted: votes.deletedCount,
    });
  } catch (error) {
    console.error("Clear vote data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
