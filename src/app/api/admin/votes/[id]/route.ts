import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Vote from "@/models/Vote";
import CandidateApplication from "@/models/CandidateApplication";
import User from "@/models/User";
import { requireAdmin, isGuardError } from "@/lib/guards";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (isGuardError(guard)) return guard.error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid vote ID" }, { status: 400 });
  }

  await dbConnect();
  const vote = await Vote.findById(id);
  if (!vote) {
    return NextResponse.json({ error: "Vote not found" }, { status: 404 });
  }

  await vote.deleteOne();
  await CandidateApplication.findByIdAndUpdate(vote.candidateId, { $inc: { voteCount: -1 } });
  await User.findByIdAndUpdate(vote.userId, { hasVoted: false });

  return NextResponse.json({ message: "Vote deleted" });
}
