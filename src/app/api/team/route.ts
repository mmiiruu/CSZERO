import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";

export async function GET() {
  try {
    await dbConnect();
    const members = await TeamMember.find().sort({ order: 1 }).lean();
    return NextResponse.json(members);
  } catch (error) {
    console.error("Fetch team error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
