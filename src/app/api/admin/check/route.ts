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
    const user = await db.collection("users").findOne({ email: session.user.email });

    return NextResponse.json({ role: user?.role || "user" });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json({ role: null }, { status: 500 });
  }
}
