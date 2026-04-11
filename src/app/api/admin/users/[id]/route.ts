import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import clientPromise from "@/lib/mongodb-client";

const VALID_ROLES = ["user", "staff", "admin"] as const;
type Role = (typeof VALID_ROLES)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── 1. Auth: only admins may call this ─────────────────────────
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = (await clientPromise).db();
    const caller = await db.collection("users").findOne({ email: session.user.email });
    if (caller?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: admin role required" }, { status: 403 });
    }

    // ── 2. Validate request body ────────────────────────────────────
    const body = await req.json();
    const newRole: Role = body.role;
    if (!VALID_ROLES.includes(newRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    // ── 3. Load target user ─────────────────────────────────────────
    await dbConnect();
    const { id } = await params;
    const target = await User.findById(id);
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── 4. Safeguard: cannot change own role ────────────────────────
    if (target.email === session.user.email) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 422 }
      );
    }

    // ── 5. Safeguard: cannot remove the last admin ──────────────────
    if (target.role === "admin" && newRole !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the last admin in the system" },
          { status: 422 }
        );
      }
    }

    // ── 6. Apply update ─────────────────────────────────────────────
    target.role = newRole;
    await target.save();

    return NextResponse.json({
      message: `Role updated to "${newRole}"`,
      user: { id: target._id, email: target.email, role: target.role },
    });
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
