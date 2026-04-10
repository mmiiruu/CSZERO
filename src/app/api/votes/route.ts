import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Vote from "@/models/Vote";
import Candidate from "@/models/Candidate";
import User from "@/models/User";
import { auth } from "@/lib/auth";

// Default candidates seeded when the collection is empty.
const DEFAULT_CANDIDATES = [
  {
    name: "Alice Johnson",
    role: "President Candidate",
    image: "",
    bio: "Passionate about making CS accessible to everyone. 3 years in CSKU with experience leading workshops and hackathons.",
    voteCount: 0,
  },
  {
    name: "David Kim",
    role: "President Candidate",
    image: "",
    bio: "Focused on industry partnerships and internship opportunities. Strong connections with tech companies.",
    voteCount: 0,
  },
  {
    name: "Sara Martinez",
    role: "President Candidate",
    image: "",
    bio: "Believes in community-first leadership and inclusive events. Wants to expand CSKU's reach to all faculties.",
    voteCount: 0,
  },
];

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    await dbConnect();

    let candidates = await Candidate.find().lean();

    // Auto-seed on first run so the UI always receives real ObjectId-backed records.
    if (candidates.length === 0) {
      await Candidate.insertMany(DEFAULT_CANDIDATES);
      candidates = await Candidate.find().lean();
    }

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
    const { candidateId } = await req.json();

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }

    // Reject non-ObjectId strings early — prevents Mongoose CastError.
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
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
