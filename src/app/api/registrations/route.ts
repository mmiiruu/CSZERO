import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";

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
