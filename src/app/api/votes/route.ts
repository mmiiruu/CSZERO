import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import clientPromise from "@/lib/mongodb-client";
import Vote from "@/models/Vote";
import CandidateApplication from "@/models/CandidateApplication";
import User from "@/models/User";
import { auth } from "@/lib/auth";

async function isVotingOpen(): Promise<boolean> {
  const db = (await clientPromise).db();
  const doc = await db.collection("settings").findOne({ _id: "voting" as unknown as never });
  return doc?.open ?? false;
}

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = ((session?.user as any)?.role as string) === "admin";
    const open = await isVotingOpen();

    if (!open) {
      return NextResponse.json({ votingOpen: false, candidates: [], hasVoted: false, isAdmin });
    }

    await dbConnect();
    const applications = await CandidateApplication.find().sort({ createdAt: 1 }).lean();

    let hasVoted = false;
    if (session?.user?.id) {
      const existingVote = await Vote.findOne({ userId: session.user.id });
      hasVoted = !!existingVote;
    }

    const candidates = applications.map((a: any) => ({
      _id: a._id.toString(),
      name: a.name,
      nickname: a.nickname || "",
      image: a.image || "",
      motto: a.motto || "",
      section: a.section || "",
      videoUrl: a.videoUrl || "",
      dutyAnswer: a.dutyAnswer || "",
      visionAnswer: a.visionAnswer || "",
      strengthWeaknessAnswer: a.strengthWeaknessAnswer || "",
      ...(isAdmin ? { voteCount: a.voteCount ?? 0 } : {}),
    }));

    return NextResponse.json({ votingOpen: true, candidates, hasVoted, isAdmin });
  } catch (error) {
    console.error("Fetch votes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const STUDENT_ID_RE = /^69104[05]\d{4}$/;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!session.user.email.toLowerCase().endsWith("@ku.th")) {
      return NextResponse.json({ error: "ต้องใช้อีเมล @ku.th เท่านั้น" }, { status: 403 });
    }

    const open = await isVotingOpen();
    if (!open) {
      return NextResponse.json({ error: "การโหวตยังไม่เปิด" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const candidateId = body?.candidateId;
    const studentId = typeof body?.studentId === "string" ? body.studentId.trim() : "";
    const voterName = typeof body?.voterName === "string" ? body.voterName.trim().slice(0, 200) : "";

    if (!STUDENT_ID_RE.test(studentId)) {
      return NextResponse.json({ error: "รหัสนิสิตไม่ถูกต้อง (ต้องขึ้นต้นด้วย 691040 หรือ 691045)" }, { status: 400 });
    }
    if (!voterName) {
      return NextResponse.json({ error: "กรุณากรอกชื่อจริง นามสกุล ภาษาอังกฤษ" }, { status: 400 });
    }

    if (typeof candidateId !== "string" || !mongoose.Types.ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: "Invalid candidate ID" }, { status: 400 });
    }

    const application = await CandidateApplication.findById(candidateId);
    if (!application) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    try {
      await Vote.create({ userId: session.user.id, candidateId, studentId, voterEmail: session.user.email, voterName });
    } catch (err: any) {
      if (err?.code === 11000) {
        return NextResponse.json({ error: "คุณโหวตไปแล้ว" }, { status: 409 });
      }
      throw err;
    }

    await CandidateApplication.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });
    await User.findByIdAndUpdate(session.user.id, { hasVoted: true });

    return NextResponse.json({ message: "Vote cast successfully" });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
