import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export async function GET() {
  try {
    await dbConnect();
    const candidates = await Candidate.find().lean();
    return NextResponse.json(candidates);
  } catch (error) {
    console.error("Fetch candidates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
