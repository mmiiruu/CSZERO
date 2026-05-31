import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  const db = (await clientPromise).db();
  const dbUser = await db.collection("users").findOne({ email: session.user.email });
  const role: string = dbUser?.role || "user";

  if (role !== "admin" && role !== "staff") {
    redirect("/");
  }

  return <>{children}</>;
}
