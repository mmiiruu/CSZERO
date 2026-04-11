import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { notifyRegistration } from "@/lib/discord";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { event, name, email, answers } = body;

    if (!event || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["cs101", "hello-world"].includes(event)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }

    // Check for duplicate registration
    const existing = await Registration.findOne({ email, event });
    if (existing) {
      return NextResponse.json(
        { error: "You have already registered for this event" },
        { status: 409 }
      );
    }

    const registration = await Registration.create({
      event,
      name,
      email,
      answers: answers || {},
    });

    // Fire-and-forget — does not block or affect the response
    notifyRegistration({ event, name, email, answers });

    return NextResponse.json(
      { message: "Registration successful", id: registration._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Only admin and staff may read all registrations
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = (await clientPromise).db();
    const caller = await db.collection("users").findOne({ email: session.user.email });
    const role: string = caller?.role || "user";
    if (role !== "admin" && role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const registrations = await Registration.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Fetch registrations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
