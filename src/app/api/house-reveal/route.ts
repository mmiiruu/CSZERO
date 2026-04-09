import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const registration = await Registration.findOne({
      email: email.toLowerCase().trim(),
      event: "hello-world",
    });

    if (!registration) {
      return NextResponse.json(
        { error: "No registration found with this email. Please register first." },
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
