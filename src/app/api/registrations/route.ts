import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuth, requireAdmin, requireStaff, getCallerRole, isGuardError } from "@/lib/guards";
import { submitRegistration } from "@/lib/registrationIntake";
import Registration from "@/models/Registration";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isGuardError(authResult)) return authResult.error;

    const body = await req.json();
    const role = await getCallerRole(authResult.email);

    const result = await submitRegistration({
      event: body?.event,
      email: authResult.email,
      name: body?.name,
      answers: body?.answers,
      canBypassGate: role === "admin" || role === "staff",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ message: "Registration successful", id: result.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (isGuardError(guard)) return guard.error;

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
    const guard = await requireStaff();
    if (isGuardError(guard)) return guard.error;

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
