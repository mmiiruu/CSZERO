import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ role: null }, { status: 401 });
    }

    const role: string = (session.user as any).role || "user";
    if (role !== "admin" && role !== "staff") {
      return NextResponse.json({ role }, { status: 403 });
    }
    return NextResponse.json({ role, email: session.user.email });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json({ role: null }, { status: 500 });
  }
}
