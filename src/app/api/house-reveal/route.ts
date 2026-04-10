import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { auth } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const emailRegex = new RegExp(`^${session.user.email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    const registration = await Registration.findOne({
      email: { $regex: emailRegex },
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
