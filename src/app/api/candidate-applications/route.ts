import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import CandidateApplication from "@/models/CandidateApplication";
import { candidateRegistrationConfig } from "@/config/candidate";

const MAX_STR = 200;
const MAX_TEXT = 2000;

function clean(v: unknown, max = MAX_STR): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

async function getCallerRole(email: string): Promise<string> {
  const db = (await clientPromise).db();
  const user = await db.collection("users").findOne({ email });
  return user?.role || "user";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getCallerRole(session.user.email);
    const isAdminOrStaff = role === "admin" || role === "staff";

    if (!candidateRegistrationConfig.open && !isAdminOrStaff) {
      return NextResponse.json(
        { error: "Candidate registration is not open" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const name = clean(body?.name);
    const studentId = clean(body?.studentId, 50);
    const year = clean(body?.year, 20);
    const role_ = clean(body?.role);
    const bio = clean(body?.bio, MAX_TEXT);
    const motivation = clean(body?.motivation, MAX_TEXT);
    const image = clean(body?.image, 500);

    if (!name || !studentId || !year || !role_ || !bio || !motivation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const email = session.user.email.trim().toLowerCase();

    await dbConnect();
    const existing = await CandidateApplication.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted an application" },
        { status: 409 }
      );
    }

    const app = await CandidateApplication.create({
      name, email, studentId, year, role: role_, bio, motivation, image: image || undefined,
    });

    return NextResponse.json({ message: "Application submitted", id: app._id }, { status: 201 });
  } catch (error) {
    console.error("Candidate application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = await getCallerRole(session.user.email);
    if (role !== "admin" && role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const applications = await CandidateApplication.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Fetch candidate applications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
