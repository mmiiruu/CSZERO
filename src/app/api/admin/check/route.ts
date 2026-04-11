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

    const role: string = user?.role || "user";
    // Only admin and staff may access the dashboard
    if (role !== "admin" && role !== "staff") {
      return NextResponse.json({ role }, { status: 403 });
    }
    return NextResponse.json({ role });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json({ role: null }, { status: 500 });
  }
}
