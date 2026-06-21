import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import CandidateApplication from "@/models/CandidateApplication";
import { candidateRegistrationConfig } from "@/config/candidate";
import { isRegistrationOpen } from "@/lib/registration";

const MAX_STR = 200;
const MAX_TEXT = 3000;

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

    const callerRole = await getCallerRole(session.user.email);
    const isAdminOrStaff = callerRole === "admin" || callerRole === "staff";

    if (!isRegistrationOpen(candidateRegistrationConfig) && !isAdminOrStaff) {
      return NextResponse.json(
        { error: "Candidate registration is not open" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const name = clean(body?.name);
    const nickname = clean(body?.nickname);
    const section = clean(body?.section, 20);
    const image = clean(body?.image, 500);
    const motto = clean(body?.motto, MAX_TEXT);
    const videoUrl = clean(body?.videoUrl, 500);
    const dutyAnswer = clean(body?.dutyAnswer, MAX_TEXT);
    const visionAnswer = clean(body?.visionAnswer, MAX_TEXT);
    const strengthWeaknessAnswer = clean(body?.strengthWeaknessAnswer, MAX_TEXT);

    if (!name || !nickname || !section || !motto || !videoUrl || !dutyAnswer || !visionAnswer || !strengthWeaknessAnswer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const email = session.user.email.trim().toLowerCase();

    await dbConnect();
    const existing = await CandidateApplication.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "คุณส่งใบสมัครไปแล้ว" },
        { status: 409 }
      );
    }

    const app = await CandidateApplication.create({
      name, email, nickname, section, motto, videoUrl,
      dutyAnswer, visionAnswer, strengthWeaknessAnswer,
      image: image || undefined,
    });

    return NextResponse.json({ message: "Application submitted", id: app._id }, { status: 201 });
  } catch (error) {
    console.error("Candidate application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const callerRole = await getCallerRole(session.user.email);
    if (callerRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await dbConnect();
    const deleted = await CandidateApplication.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete candidate application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const callerRole = await getCallerRole(session.user.email);
    if (callerRole !== "admin" && callerRole !== "staff") {
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
