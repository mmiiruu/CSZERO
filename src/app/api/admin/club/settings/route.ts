import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";

async function getCallerRole(email: string) {
  const db = (await clientPromise).db();
  const user = await db.collection("users").findOne({ email });
  return user?.role || "user";
}

async function getSettings() {
  const db = (await clientPromise).db();
  return db.collection("settings");
}

export async function GET() {
  try {
    const settings = await getSettings();
    const doc = await settings.findOne({ _id: "clubBooking" as unknown as never });
    return NextResponse.json({ clubBookingOpen: doc?.open ?? false });
  } catch (error) {
    console.error("Get club booking status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = await getCallerRole(session.user.email);
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { open } = await req.json();
    if (typeof open !== "boolean") {
      return NextResponse.json({ error: "Missing open boolean" }, { status: 400 });
    }

    const settings = await getSettings();
    await settings.updateOne(
      { _id: "clubBooking" as unknown as never },
      { $set: { open } },
      { upsert: true }
    );

    return NextResponse.json({ clubBookingOpen: open });
  } catch (error) {
    console.error("Toggle club booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
