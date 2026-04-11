import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import clientPromise from "@/lib/mongodb-client";

/** Requires admin OR staff role. Returns the caller's role on success. */
async function requireStaffOrAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const db = (await clientPromise).db();
  const caller = await db.collection("users").findOne({ email: session.user.email });
  const role: string = caller?.role || "user";
  if (role !== "admin" && role !== "staff") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { callerEmail: session.user.email as string, callerRole: role as "admin" | "staff" };
}

export async function GET() {
  const guard = await requireStaffOrAdmin();
  if ("error" in guard) return guard.error;

  await dbConnect();
  const users = await User.find()
    .sort({ createdAt: -1 })
    .select("_id name email image role createdAt")
    .lean();

  return NextResponse.json(users);
}
