import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import type { RegistrationConfig } from "@/lib/registration";
import type { AllowedEvent } from "@/lib/eventRegistry";

export type RegistrationEventKey = AllowedEvent;

export type RegistrationCapacityStatus = {
  total: number | null;
  current: number;
  remaining: number | null;
  isFull: boolean;
};

export async function getRegistrationCapacityStatus(
  event: AllowedEvent,
  registration: RegistrationConfig
): Promise<RegistrationCapacityStatus> {
  await dbConnect();

  const current = await Registration.countDocuments({ event });
  const total = registration.capacity?.total ?? null;

  if (total === null) {
    return {
      total,
      current,
      remaining: null,
      isFull: false,
    };
  }

  return {
    total,
    current,
    remaining: Math.max(0, total - current),
    isFull: current >= total,
  };
}
