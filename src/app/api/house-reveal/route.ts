import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { auth } from "@/lib/auth";
import { helloWorldConfig } from "@/config/events/hello-world";

export async function POST(_req: NextRequest) {
    try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { revealAt } = helloWorldConfig.reveal;
    if (revealAt && Date.now() < new Date(revealAt).getTime()) {
      return NextResponse.json(
        { error: "ยังไม่ถึงเวลาประกาศบ้าน", notReady: true, revealAt },
        { status: 403 }
      );
    }

    await dbConnect();

    const email = session.user.email.trim().toLowerCase();
    const registration = await Registration.findOne({
      email,
      event: "hello-world",
    });

    if (!registration) {
      return NextResponse.json(
        { error: "No registration found for your account. Please register first." },
        { status: 404 }
      );
    }

    if (!registration.house) {
      return NextResponse.json(
        { error: "Houses have not been assigned yet. Check back later!" },
        { status: 400 }
      );
    }

    return NextResponse.json({ house: registration.house });
  } catch (error) {
    console.error("House reveal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
