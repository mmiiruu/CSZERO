import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import clientPromise from "@/lib/mongodb-client";

/** Reusable admin-role guard — returns the caller's role or throws a Response. */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const db = (await clientPromise).db();
  const caller = await db.collection("users").findOne({ email: session.user.email });
  if (caller?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { callerEmail: session.user.email as string };
}

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  await dbConnect();
  const users = await User.find()
    .sort({ createdAt: -1 })
    .select("_id name email image role createdAt")
    .lean();

  return NextResponse.json(users);
}
