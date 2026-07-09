import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ClubApplication from "@/models/ClubApplication";
import InterviewSlot from "@/models/InterviewSlot";
import { sanitizeAnswers } from "@/lib/registrationIntake";
import { isClubApplicationOpen } from "@/lib/clubSettings";
import { notifyClubApplication } from "@/lib/discord";
import { APPLICANT_DEPARTMENTS } from "@/config/team";

const APPLICANT_DEPARTMENT_KEYS = APPLICANT_DEPARTMENTS.map((d) => d.key) as string[];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ applied: false });
    }
    await dbConnect();
    const app = await ClubApplication.findOne({ email: session.user.email }).lean();
    let slot = null;
    if (app?.interviewSlotId) {
      slot = await InterviewSlot.findById(app.interviewSlotId).lean();
    }
    return NextResponse.json({
      applied: !!app,
      applicationId: app?._id?.toString() ?? null,
      hasSlot: !!app?.interviewSlotId,
      slot: slot ? { date: slot.date, startTime: slot.startTime, endTime: slot.endTime } : null,
    });
  } catch (error) {
    console.error("Check club application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isClubApplicationOpen())) {
      return NextResponse.json({ error: "ยังไม่เปิดรับสมัคร" }, { status: 403 });
    }

    const body = await req.json();
    const { name, nickname, studentId, phone, contactChannel, photo, educationType, preferredDepartment1, preferredDepartment2, answers, slotId } = body;

    if (!name?.trim() || !nickname?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกชื่อ-นามสกุล และชื่อเล่น" }, { status: 400 });
    }
    if (!studentId?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกรหัสนิสิต" }, { status: 400 });
    }
    if (!phone?.trim() || !contactChannel?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกเบอร์โทรและช่องทางติดต่อ" }, { status: 400 });
    }
    if (!photo?.trim()) {
      return NextResponse.json({ error: "กรุณาอัปโหลดรูปถ่าย" }, { status: 400 });
    }
    if (!["regular", "special"].includes(educationType)) {
      return NextResponse.json({ error: "กรุณาเลือกประเภทการศึกษา" }, { status: 400 });
    }
    if (!APPLICANT_DEPARTMENT_KEYS.includes(preferredDepartment1)) {
      return NextResponse.json({ error: "กรุณาเลือกตำแหน่งที่อยากทำ อันดับ 1" }, { status: 400 });
    }
    if (!APPLICANT_DEPARTMENT_KEYS.includes(preferredDepartment2)) {
      return NextResponse.json({ error: "กรุณาเลือกตำแหน่งที่อยากทำ อันดับ 2" }, { status: 400 });
    }
    if (preferredDepartment1 === preferredDepartment2) {
      return NextResponse.json({ error: "อันดับ 1 และอันดับ 2 ต้องไม่ซ้ำกัน" }, { status: 400 });
    }
    if (!slotId || typeof slotId !== "string" || !mongoose.Types.ObjectId.isValid(slotId)) {
      return NextResponse.json({ error: "กรุณาเลือกเวลาสัมภาษณ์" }, { status: 400 });
    }

    const email = session.user.email.trim().toLowerCase();
    await dbConnect();

    const existing = await ClubApplication.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "คุณได้สมัครไปแล้ว" }, { status: 409 });
    }

    const application = await ClubApplication.create({
      name: name.trim(),
      nickname: nickname.trim(),
      studentId: studentId.trim(),
      email,
      phone: phone.trim(),
      contactChannel: contactChannel.trim(),
      photo: photo.trim(),
      educationType,
      preferredDepartment1,
      preferredDepartment2,
      answers: sanitizeAnswers(answers),
    });

    try {
      const reserved = await InterviewSlot.findOneAndUpdate(
        { _id: slotId, $expr: { $lt: [{ $size: "$bookings" }, "$capacity"] } },
        { $push: { bookings: { applicationId: application._id, email } } },
        { new: true }
      );

      if (!reserved) {
        await ClubApplication.findByIdAndDelete(application._id);
        return NextResponse.json({ error: "ช่วงเวลานี้เต็มแล้ว กรุณาเลือกใหม่" }, { status: 409 });
      }

      await ClubApplication.findByIdAndUpdate(application._id, {
        $set: { interviewSlotId: reserved._id },
      });

      // Fire-and-forget — don't let webhook failure affect the response
      notifyClubApplication({
        name: name.trim(),
        nickname: nickname.trim(),
        studentId: studentId.trim(),
        email,
        educationType,
        preferredDepartment1,
        preferredDepartment2,
        interviewSlot: { date: reserved.date, startTime: reserved.startTime, endTime: reserved.endTime },
        answers: sanitizeAnswers(answers),
      });
    } catch (reserveError) {
      // Slot reservation failed after the application was created — roll it back
      // so the unique email index doesn't permanently lock this applicant out.
      await ClubApplication.findByIdAndDelete(application._id);
      throw reserveError;
    }

    return NextResponse.json(
      { message: "สมัครสำเร็จ", id: application._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Club application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
