import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Cs101Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (role !== "admin" && role !== "staff") {
    redirect("/");
  }

  return <>{children}</>;
}
