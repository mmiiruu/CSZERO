import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const db = (await clientPromise).db();
  const dbUser = await db.collection("users").findOne({ email: session.user.email });
  const role: string = dbUser?.role || "user";
  return role === "admin" ? role : null;
}

export async function POST(req: NextRequest) {
  try {
    const role = await requireAdmin();
    if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, nickname, role: memberRole, bio, image, order, skills, socialLinks, department, isHead } = body;

    if (!name || !memberRole) {
      return NextResponse.json({ error: "name and role are required" }, { status: 400 });
    }

    await dbConnect();
    const member = await TeamMember.create({
      name,
      nickname: nickname || "",
      role: memberRole,
      bio: bio || "",
      image: image || "",
      order: order ?? 0,
      skills: skills || [],
      socialLinks: socialLinks || {},
      department: department || "",
      isHead: isHead ?? false,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Create team member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
