import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireStaff, isGuardError } from "@/lib/guards";

export async function GET() {
  const guard = await requireStaff();
  if (isGuardError(guard)) return guard.error;

  await dbConnect();
  const users = await User.find()
    .sort({ createdAt: -1 })
    .select("_id name email image role createdAt")
    .lean();

  return NextResponse.json(users);
}
