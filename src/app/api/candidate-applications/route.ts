import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import CandidateApplication from "@/models/CandidateApplication";
import { candidateRegistrationConfig } from "@/config/candidate";
import { isRegistrationOpen } from "@/lib/registration";
import { requireAuth, requireAdmin, requireStaff, getCallerRole, isGuardError } from "@/lib/guards";

const MAX_STR = 200;
const MAX_TEXT = 3000;

function clean(v: unknown, max = MAX_STR): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isGuardError(authResult)) return authResult.error;

    const callerRole = await getCallerRole(authResult.email);
    const isAdminOrStaff = callerRole === "admin" || callerRole === "staff";

    if (!isRegistrationOpen(candidateRegistrationConfig) && !isAdminOrStaff) {
      return NextResponse.json({ error: "Candidate registration is not open" }, { status: 403 });
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
    const conflictAnswer = clean(body?.conflictAnswer, MAX_TEXT);

    if (!name || !nickname || !section || !motto || !dutyAnswer || !visionAnswer || !strengthWeaknessAnswer || !conflictAnswer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const email = authResult.email.trim().toLowerCase();

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
      dutyAnswer, visionAnswer, strengthWeaknessAnswer, conflictAnswer,
      image: image || undefined,
    });

    // Fire-and-forget — don't let webhook failure affect the response
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const trunc = (s: string, n = 1024) => s.slice(0, n) || "—";
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "📋 ใบสมัครประธานรุ่นใหม่",
            color: 0x3b82f6,
            fields: [
              { name: "ชื่อ",         value: name,              inline: true  },
              { name: "ชื่อเล่น",     value: nickname,          inline: true  },
              { name: "ภาค",          value: `ภาค${section}`,   inline: true  },
              { name: "อีเมล",        value: email,             inline: false },
              { name: "คติประจำใจ",   value: trunc(motto),      inline: false },
              { name: "🎬 ลิงก์วิดีโอแนะนำตัว", value: videoUrl || "—", inline: false },
              { name: "❓ หน้าที่ของประธานรุ่นคืออะไร",                     value: trunc(dutyAnswer),             inline: false },
              { name: "❓ แนวคิดหรือกิจกรรมที่อยากผลักดัน",                value: trunc(visionAnswer),           inline: false },
              { name: "❓ จุดแข็งและจุดอ่อนของตัวเอง",                      value: trunc(strengthWeaknessAnswer), inline: false },
              { name: "❓ จัดการความขัดแย้งระหว่างเพื่อนในทีม",              value: trunc(conflictAnswer),         inline: false },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "CSKU · สมัครประธานรุ่น" },
          }],
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ message: "Application submitted", id: app._id }, { status: 201 });
  } catch (error) {
    console.error("Candidate application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (isGuardError(guard)) return guard.error;

    const { id } = await req.json();
    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

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
    const guard = await requireStaff();
    if (isGuardError(guard)) return guard.error;

    await dbConnect();
    const applications = await CandidateApplication.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Fetch candidate applications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
