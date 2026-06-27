import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ClubApplication from "@/models/ClubApplication";
import { sanitizeAnswers } from "@/lib/registrationIntake";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ applied: false });
    }
    await dbConnect();
    const app = await ClubApplication.findOne({ email: session.user.email }).lean();
    return NextResponse.json({
      applied: !!app,
      applicationId: app?._id?.toString() ?? null,
      hasSlot: !!app?.interviewSlotId,
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

    const body = await req.json();
    const { name, surname, nickname, phone, contactChannel, photo, educationType, answers } = body;

    if (!name?.trim() || !surname?.trim() || !nickname?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกชื่อ นามสกุล และชื่อเล่น" }, { status: 400 });
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

    const email = session.user.email.trim().toLowerCase();
    await dbConnect();

    const existing = await ClubApplication.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "คุณได้สมัครไปแล้ว" }, { status: 409 });
    }

    const application = await ClubApplication.create({
      name: name.trim(),
      surname: surname.trim(),
      nickname: nickname.trim(),
      email,
      phone: phone.trim(),
      contactChannel: contactChannel.trim(),
      photo: photo.trim(),
      educationType,
      answers: sanitizeAnswers(answers),
    });

    return NextResponse.json(
      { message: "สมัครสำเร็จ", id: application._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Club application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
