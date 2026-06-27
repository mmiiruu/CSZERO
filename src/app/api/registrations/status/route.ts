import { NextRequest, NextResponse } from "next/server";
import { isRegistrationOpen } from "@/lib/registration";
import { getRegistrationCapacityStatus } from "@/lib/registrationCapacity";
import { ALLOWED_EVENTS, REGISTRATION_CONFIG, type AllowedEvent } from "@/lib/eventRegistry";

export async function GET(req: NextRequest) {
  try {
    const event = req.nextUrl.searchParams.get("event");
    if (!event || !ALLOWED_EVENTS.includes(event as AllowedEvent)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }
    const ev = event as AllowedEvent;
    const registration = REGISTRATION_CONFIG[ev];
    const capacity = await getRegistrationCapacityStatus(ev, registration);

    return NextResponse.json(
      {
        event,
        isOpen: isRegistrationOpen(registration),
        ...capacity,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Registration status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
