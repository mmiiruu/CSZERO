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

async function requireAdminOrStaff() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const db = (await clientPromise).db();
  const dbUser = await db.collection("users").findOne({ email: session.user.email });
  const role: string = dbUser?.role || "user";
  return role === "admin" || role === "staff" ? role : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = await requireAdminOrStaff();
    if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { name, nickname, role: memberRole, bio, image, order, department, isHead } = body;

    if (!name || !memberRole) {
      return NextResponse.json({ error: "name and role are required" }, { status: 400 });
    }

    await dbConnect();
    const member = await TeamMember.findByIdAndUpdate(
      id,
      { name, nickname: nickname || "", role: memberRole, bio: bio || "", image: image || "", order: order ?? 0, department: department || "", isHead: isHead ?? false },
      { new: true }
    );

    if (!member) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Update team member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = await requireAdmin();
    if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await dbConnect();
    const member = await TeamMember.findByIdAndDelete(id);

    if (!member) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete team member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
