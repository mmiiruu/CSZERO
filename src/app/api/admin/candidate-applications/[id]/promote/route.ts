import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import CandidateApplication from "@/models/CandidateApplication";
import Candidate from "@/models/Candidate";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await dbConnect();
    const app = await CandidateApplication.findById(id);
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (app.promoted) {
      return NextResponse.json({ error: "Already promoted" }, { status: 409 });
    }

    const candidate = await Candidate.create({
      name: app.name,
      role: app.role,
      image: app.image || "",
      bio: app.bio,
      voteCount: 0,
    });

    app.promoted = true;
    app.promotedCandidateId = candidate._id as mongoose.Types.ObjectId;
    await app.save();

    return NextResponse.json({ message: "Promoted", candidateId: candidate._id });
  } catch (error) {
    console.error("Promote candidate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
