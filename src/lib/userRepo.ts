import clientPromise from "@/lib/mongodb-client";
import type { Role } from "@/lib/guards";

export async function getUserRole(email: string): Promise<Role> {
  const db = (await clientPromise).db();
  const user = await db.collection("users").findOne({ email });
  return (user?.role as Role) || "user";
}
