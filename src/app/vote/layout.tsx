import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function VoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin?callbackUrl=/vote");
  }

  if ((session.user as any)?.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
