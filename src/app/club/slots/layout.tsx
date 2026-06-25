import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ClubSlotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/club/slots");
  }
  return <>{children}</>;
}
