import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import Vote from "@/models/Vote";

async function requireAdminOrStaff() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const db = (await clientPromise).db();
  const user = await db.collection("users").findOne({ email: session.user.email });
  const role: string = user?.role || "user";
  return role === "admin" || role === "staff" ? role : null;
}

export async function GET(req: NextRequest) {
  try {
    const role = await requireAdminOrStaff();
    if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
