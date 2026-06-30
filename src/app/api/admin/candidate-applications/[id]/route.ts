import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import CandidateApplication from "@/models/CandidateApplication";
import { requireAdmin, isGuardError } from "@/lib/guards";

const MAX_STR = 200;
const MAX_TEXT = 3000;

function clean(v: unknown, max = MAX_STR): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin();
    if (isGuardError(guard)) return guard.error;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const name = clean(body?.name);
    const nickname = clean(body?.nickname);
    const section = clean(body?.section, 20);
    const image = clean(body?.image, 500);
    const motto = clean(body?.motto, MAX_TEXT);
    const videoUrl = clean(body?.videoUrl, 500);
    const dutyAnswer = clean(body?.dutyAnswer, MAX_TEXT);
    const visionAnswer = clean(body?.visionAnswer, MAX_TEXT);
    const strengthWeaknessAnswer = clean(body?.strengthWeaknessAnswer, MAX_TEXT);
    const conflictAnswer = clean(body?.conflictAnswer, MAX_TEXT);

    if (!name || !nickname || !section) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const updated = await CandidateApplication.findByIdAndUpdate(
      id,
      { name, nickname, section, image: image || undefined, motto, videoUrl, dutyAnswer, visionAnswer, strengthWeaknessAnswer, conflictAnswer },
      { new: true, runValidators: true }
    );

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error("Edit candidate application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
