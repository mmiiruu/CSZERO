import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";

export async function POST(req: NextRequest) {
  try {
    // Check admin role
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = (await clientPromise).db();
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { registrationId, house } = body;

    if (!registrationId || !house) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!["spade", "heart", "diamond", "club"].includes(house)) {
      return NextResponse.json({ error: "Invalid house" }, { status: 400 });
    }

    await Registration.findByIdAndUpdate(registrationId, { house });

    return NextResponse.json({ message: "House assigned successfully" });
  } catch (error) {
    console.error("Assign house error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
