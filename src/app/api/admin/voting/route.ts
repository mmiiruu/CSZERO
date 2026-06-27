import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb-client";
import { requireAdmin, isGuardError } from "@/lib/guards";

async function getSettings() {
  const db = (await clientPromise).db();
  return db.collection("settings");
}

export async function GET() {
  try {
    const settings = await getSettings();
    const doc = await settings.findOne({ _id: "voting" as unknown as never });
    return NextResponse.json({ votingOpen: doc?.open ?? false });
  } catch (error) {
    console.error("Get voting status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (isGuardError(guard)) return guard.error;

    const { open } = await req.json();
    if (typeof open !== "boolean") {
      return NextResponse.json({ error: "Missing open boolean" }, { status: 400 });
    }

    const settings = await getSettings();
    await settings.updateOne(
      { _id: "voting" as unknown as never },
      { $set: { open } },
      { upsert: true }
    );

    return NextResponse.json({ votingOpen: open });
  } catch (error) {
    console.error("Toggle voting error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
