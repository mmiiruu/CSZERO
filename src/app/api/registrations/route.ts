import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import Registration, { HOUSE_KEYS, type HouseKey } from "@/models/Registration";
import { notifyRegistration } from "@/lib/discord";
import { cs101Config } from "@/config/events/cs101";
import { helloWorldConfig } from "@/config/events/hello-world";
import { isRegistrationOpen } from "@/lib/registration";
import { getRegistrationCapacityStatus } from "@/lib/registrationCapacity";

const ALLOWED_EVENTS = ["cs101", "hello-world"] as const;

const REGISTRATION_CONFIG = {
  "cs101": cs101Config.registration,
  "hello-world": helloWorldConfig.registration,
} as const;

// Pick the least-populated house that still has room. Returns null when all
// houses are at capacity so the caller can reject with a friendly error.
// Not transactional — a slight imbalance is acceptable for this event scale.
async function pickBalancedHouse(perHouseLimit: number): Promise<HouseKey | null> {
  const grouped = await Registration.aggregate<{ _id: HouseKey | null; count: number }>([
    { $match: { event: "hello-world" } },
    { $group: { _id: "$house", count: { $sum: 1 } } },
  ]);
  const counts: Record<HouseKey, number> = Object.fromEntries(
    HOUSE_KEYS.map((k) => [k, 0])
  ) as Record<HouseKey, number>;
  for (const g of grouped) {
    if (g._id && counts[g._id] !== undefined) counts[g._id] = g.count;
  }
  const available = HOUSE_KEYS.filter((k) => counts[k] < perHouseLimit);
  if (available.length === 0) return null;
  const min = Math.min(...available.map((k) => counts[k]));
  const candidates = available.filter((k) => counts[k] === min);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

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
    const db = (await clientPromise).db();
    const caller = await db.collection("users").findOne({ email: session.user.email });
    const role: string = caller?.role || "user";
    const canBypassGate = role === "admin" || role === "staff";
    if (!canBypassGate && !isRegistrationOpen(REGISTRATION_CONFIG[event as typeof ALLOWED_EVENTS[number]])) {
      return NextResponse.json({ error: "Registration is not open for this event" }, { status: 403 });
    }
    if (typeof name !== "string" || name.trim().length === 0 || name.length > 200) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const email = session.user.email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanAnswers = sanitizeAnswers(body?.answers);

    await dbConnect();

    const existing = await Registration.findOne({ email, event: event as typeof ALLOWED_EVENTS[number] });
    if (existing) {
      return NextResponse.json(
        { error: "You have already registered for this event" },
        { status: 409 }
      );
    }

    let house: HouseKey | undefined;
    if (event === "cs101") {
      const capacity = await getRegistrationCapacityStatus("cs101", cs101Config.registration);
      if (capacity.isFull) {
        return NextResponse.json(
          { error: "ขออภัย — ที่นั่ง CS101 เต็มแล้ว" },
          { status: 403 }
        );
      }
    }

    if (event === "hello-world") {
      const { total, perHouse } = helloWorldConfig.registration.capacity;
      const currentTotal = await Registration.countDocuments({ event: "hello-world" });
      if (currentTotal >= total) {
        return NextResponse.json(
          { error: "ขออภัย — ที่นั่ง Hello World เต็มแล้ว" },
          { status: 403 }
        );
      }
      const picked = await pickBalancedHouse(perHouse);
      if (!picked) {
        return NextResponse.json(
          { error: "ขออภัย — บ้านทั้งหมดเต็มแล้ว" },
          { status: 403 }
        );
      }
      house = picked;
    }

    const registration = await Registration.create({
      event: event as typeof ALLOWED_EVENTS[number],
      name: cleanName,
      email,
      answers: cleanAnswers,
      ...(house && { house }),
    });

    if (event === "cs101") {
      const capacity = await getRegistrationCapacityStatus("cs101", cs101Config.registration);
      if (capacity.total !== null && capacity.current > capacity.total) {
        await Registration.findByIdAndDelete(registration._id);
        return NextResponse.json(
          { error: "ขออภัย — ที่นั่ง CS101 เต็มแล้ว" },
          { status: 403 }
        );
      }
    }

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

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = (await clientPromise).db();
    const caller = await db.collection("users").findOne({ email: session.user.email });
    if (caller?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing registration id" }, { status: 400 });
    }

    await dbConnect();
    const result = await Registration.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
