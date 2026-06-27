import dbConnect from "@/lib/mongodb";
import Registration, { HOUSE_KEYS, type HouseKey } from "@/models/Registration";
import { notifyRegistration } from "@/lib/discord";
import { cs101Config } from "@/config/events/cs101";
import { helloWorldConfig } from "@/config/events/hello-world";
import { isRegistrationOpen } from "@/lib/registration";
import { getRegistrationCapacityStatus } from "@/lib/registrationCapacity";
import { ALLOWED_EVENTS, REGISTRATION_CONFIG, type AllowedEvent } from "@/lib/eventRegistry";

export { ALLOWED_EVENTS, type AllowedEvent };

export type IntakeResult =
  | { ok: true; id: string }
  | { ok: false; status: number; error: string };

export function sanitizeAnswers(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (typeof k !== "string" || v == null) continue;
    out[k.slice(0, 100)] = String(v).slice(0, 2000);
  }
  return out;
}

// Pick the least-populated house that still has room. Returns null when all
// houses are at capacity. Not transactional — slight imbalance is acceptable.
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
  const tied = available.filter((k) => counts[k] === min);
  return tied[Math.floor(Math.random() * tied.length)];
}

export async function submitRegistration(params: {
  event: string;
  email: string;
  name: string;
  answers: unknown;
  canBypassGate: boolean;
}): Promise<IntakeResult> {
  const { event, email, name, answers, canBypassGate } = params;

  if (!ALLOWED_EVENTS.includes(event as AllowedEvent)) {
    return { ok: false, status: 400, error: "Invalid event type" };
  }
  const ev = event as AllowedEvent;

  if (typeof name !== "string" || name.trim().length === 0 || name.length > 200) {
    return { ok: false, status: 400, error: "Invalid name" };
  }

  if (!canBypassGate && !isRegistrationOpen(REGISTRATION_CONFIG[ev])) {
    return { ok: false, status: 403, error: "Registration is not open for this event" };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanAnswers = sanitizeAnswers(answers);

  await dbConnect();

  const existing = await Registration.findOne({ email: cleanEmail, event: ev });
  if (existing) {
    return { ok: false, status: 409, error: "You have already registered for this event" };
  }

  let house: HouseKey | undefined;

  if (ev === "cs101") {
    const capacity = await getRegistrationCapacityStatus("cs101", cs101Config.registration);
    if (capacity.isFull) {
      return { ok: false, status: 403, error: "ขออภัย — ที่นั่ง CS101 เต็มแล้ว" };
    }
  }

  if (ev === "hello-world") {
    const { total, perHouse } = helloWorldConfig.registration.capacity;
    const currentTotal = await Registration.countDocuments({ event: "hello-world" });
    if (currentTotal >= total) {
      return { ok: false, status: 403, error: "ขออภัย — ที่นั่ง Hello World เต็มแล้ว" };
    }
    const picked = await pickBalancedHouse(perHouse);
    if (!picked) {
      return { ok: false, status: 403, error: "ขออภัย — บ้านทั้งหมดเต็มแล้ว" };
    }
    house = picked;
  }

  const registration = await Registration.create({
    event: ev,
    name: cleanName,
    email: cleanEmail,
    answers: cleanAnswers,
    ...(house && { house }),
  });

  // Race-condition guard: if another request sneaked in between the capacity
  // check and the insert, roll back and report full.
  if (ev === "cs101") {
    const capacity = await getRegistrationCapacityStatus("cs101", cs101Config.registration);
    if (capacity.total !== null && capacity.current > capacity.total) {
      await Registration.findByIdAndDelete(registration._id);
      return { ok: false, status: 403, error: "ขออภัย — ที่นั่ง CS101 เต็มแล้ว" };
    }
  }

  notifyRegistration({ event: ev, name: cleanName, email: cleanEmail, answers: cleanAnswers });

  return { ok: true, id: String(registration._id) };
}
