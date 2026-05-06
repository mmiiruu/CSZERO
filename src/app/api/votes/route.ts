import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Vote from "@/models/Vote";
import Candidate from "@/models/Candidate";
import User from "@/models/User";
import { auth } from "@/lib/auth";
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    await dbConnect();

    const candidates = await Candidate.find().lean();

    let hasVoted = false;
    if (session?.user?.id) {
      const existingVote = await Vote.findOne({ userId: session.user.id });
      hasVoted = !!existingVote;
    }

    // Serialize ObjectId fields to plain strings so the client can use them
    // directly as candidateId in the vote POST body.
    const serialized = candidates.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
    }));

    return NextResponse.json({ candidates: serialized, hasVoted });
  } catch (error) {
    console.error("Fetch votes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const candidateId = body?.candidateId;

    if (typeof candidateId !== "string" || !mongoose.Types.ObjectId.isValid(candidateId)) {
      return NextResponse.json(
        { error: "Invalid candidate ID" },
        { status: 400 }
      );
    }

    // Confirm the candidate actually exists.
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Check if user already voted.
    const existingVote = await Vote.findOne({ userId: session.user.id });
    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted" },
        { status: 409 }
      );
    }

    // Persist the vote.
    await Vote.create({ userId: session.user.id, candidateId });

    // Increment candidate vote count.
    await Candidate.findByIdAndUpdate(candidateId, {
      $inc: { voteCount: 1 },
    });

    // Mark user as voted.
    await User.findByIdAndUpdate(session.user.id, { hasVoted: true });

    return NextResponse.json({ message: "Vote cast successfully" });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
