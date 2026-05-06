import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ role: null }, { status: 401 });
    }

    const db = (await clientPromise).db();
    const dbUser = await db.collection("users").findOne({ email: session.user.email });
    const role: string = dbUser?.role || "user";

    if (role !== "admin" && role !== "staff") {
      return NextResponse.json({ role }, { status: 403 });
    }
    return NextResponse.json({ role, email: session.user.email });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json({ role: null }, { status: 500 });
  }
}
