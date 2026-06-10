import { NextRequest, NextResponse } from "next/server";
import { cs101Config } from "@/config/events/cs101";
import { helloWorldConfig } from "@/config/events/hello-world";
import { isRegistrationOpen } from "@/lib/registration";
import {
  getRegistrationCapacityStatus,
  type RegistrationEventKey,
} from "@/lib/registrationCapacity";

const REGISTRATION_CONFIG = {
  "cs101": cs101Config.registration,
  "hello-world": helloWorldConfig.registration,
} as const;

export async function GET(req: NextRequest) {
  try {
    const event = req.nextUrl.searchParams.get("event");
    if (event !== "cs101" && event !== "hello-world") {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    const registration = REGISTRATION_CONFIG[event as RegistrationEventKey];
    const capacity = await getRegistrationCapacityStatus(event as RegistrationEventKey, registration);

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
