import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/userRepo";

export type Role = "user" | "staff" | "admin";

type GuardOk = { email: string; role: Role };
type GuardErr = { error: NextResponse };
export type GuardResult = GuardOk | GuardErr;

export function isGuardError(r: GuardResult | { email: string }): r is GuardErr {
  return "error" in r;
}

export async function getCallerRole(email: string): Promise<Role> {
  return getUserRole(email);
}

export async function requireAuth(): Promise<{ email: string } | GuardErr> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { email: session.user.email };
}

export async function requireStaff(): Promise<GuardResult> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const role = await getUserRole(session.user.email);
  if (role !== "admin" && role !== "staff") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { email: session.user.email, role };
}

export async function requireAdmin(): Promise<GuardResult> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const role = await getUserRole(session.user.email);
  if (role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden: admin role required" }, { status: 403 }) };
  }
  return { email: session.user.email, role };
}
