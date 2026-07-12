import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import ClubApplication from "@/models/ClubApplication";
import { requireAdmin, isGuardError } from "@/lib/guards";
import { sanitizeAnswers } from "@/lib/registrationIntake";
import { APPLICANT_DEPARTMENTS } from "@/config/team";

const APPLICANT_DEPARTMENT_KEYS: string[] = APPLICANT_DEPARTMENTS.map((d) => d.key);
const MAX_STR = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: unknown, max = MAX_STR): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin();
    if (isGuardError(guard)) return guard.error;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const name = clean(body?.name);
    const nickname = clean(body?.nickname);
    const studentId = clean(body?.studentId, 20);
    const email = clean(body?.email, MAX_STR).toLowerCase();
    const phone = clean(body?.phone, 20);
    const contactChannel = clean(body?.contactChannel, MAX_STR);
    const educationType = body?.educationType;
    const preferredDepartment1 = body?.preferredDepartment1;
    const preferredDepartment2 = body?.preferredDepartment2;
    const answers = sanitizeAnswers(body?.answers);

    if (!name || !nickname || !studentId || !email || !phone || !contactChannel) {
      return NextResponse.json({ error: "กรอกข้อมูลไม่ครบ" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "อีเมลไม่ถูกต้อง" }, { status: 400 });
    }
    if (educationType !== "regular" && educationType !== "special") {
      return NextResponse.json({ error: "ภาคไม่ถูกต้อง" }, { status: 400 });
    }
    if (
      !APPLICANT_DEPARTMENT_KEYS.includes(preferredDepartment1) ||
      !APPLICANT_DEPARTMENT_KEYS.includes(preferredDepartment2)
    ) {
      return NextResponse.json({ error: "ตำแหน่งที่เลือกไม่ถูกต้อง" }, { status: 400 });
    }

    await dbConnect();
    const updated = await ClubApplication.findByIdAndUpdate(
      id,
      {
        name,
        nickname,
        studentId,
        email,
        phone,
        contactChannel,
        educationType,
        preferredDepartment1,
        preferredDepartment2,
        answers,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "แก้ไขข้อมูลแล้ว", application: updated });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
    }
    console.error("Edit club application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
