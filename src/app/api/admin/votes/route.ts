import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Vote from "@/models/Vote";
import { requireAdmin, isGuardError } from "@/lib/guards";


export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (isGuardError(guard)) return guard.error;

    const candidateId = req.nextUrl.searchParams.get("candidateId");

    await dbConnect();

    const filter = candidateId ? { candidateId } : {};
    const votes = await Vote.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json(votes.map((v: any) => ({
      _id: v._id.toString(),
      voterEmail: v.voterEmail || "",
      voterName: v.voterName || "",
      studentId: v.studentId || "",
      candidateId: v.candidateId,
      createdAt: v.createdAt,
    })));
  } catch (error) {
    console.error("Admin votes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
