import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

const CANDIDATES = [
  {
    name: "Alice Johnson",
    role: "President Candidate",
    image: "",
    bio: "Passionate about making CS accessible to everyone. 3 years in CSKU with experience leading workshops and hackathons.",
    voteCount: 0,
  },
  {
    name: "David Kim",
    role: "President Candidate",
    image: "",
    bio: "Focused on industry partnerships and internship opportunities. Strong connections with tech companies.",
    voteCount: 0,
  },
  {
    name: "Sara Martinez",
    role: "President Candidate",
    image: "",
    bio: "Believes in community-first leadership and inclusive events. Wants to expand CSKU's reach to all faculties.",
    voteCount: 0,
  },
];

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const db = (await clientPromise).db();
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    // Clear existing candidates and votes, then re-seed
    await Candidate.deleteMany({});
    const inserted = await Candidate.insertMany(CANDIDATES);

    return NextResponse.json({
      message: `Seeded ${inserted.length} candidates`,
      count: inserted.length,
    });
  } catch (error) {
    console.error("Seed candidates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
