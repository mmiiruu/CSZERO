import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { notifyRegistration } from "@/lib/discord";

const ALLOWED_EVENTS = ["cs101", "hello-world"] as const;

function sanitizeAnswers(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (typeof k !== "string") continue;
    if (v == null) continue;
    out[k.slice(0, 100)] = String(v).slice(0, 2000);
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const event = body?.event;
    const name = body?.name;

    if (typeof event !== "string" || !ALLOWED_EVENTS.includes(event as typeof ALLOWED_EVENTS[number])) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }
    if (typeof name !== "string" || name.trim().length === 0 || name.length > 200) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const email = session.user.email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanAnswers = sanitizeAnswers(body?.answers);

    await dbConnect();

    const existing = await Registration.findOne({ email, event });
    if (existing) {
      return NextResponse.json(
        { error: "You have already registered for this event" },
        { status: 409 }
      );
    }

    const registration = await Registration.create({
      event,
      name: cleanName,
      email,
      answers: cleanAnswers,
    });

    notifyRegistration({ event: event as "cs101" | "hello-world", name: cleanName, email, answers: cleanAnswers });

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
