import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function requireMember() {
  const user = await getCurrentUser();

  if (!user?.member) {
    redirect("/login");
  }

  return user.member;
}
