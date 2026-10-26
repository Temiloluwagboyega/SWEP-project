import { redirect } from "next/navigation";
import { getSessionUser } from "./auth";
import type { SessionUser } from "./access";
export async function requireUser(
  portal?: "student" | "staff",
): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) return redirect("/login");
  if (portal === "student" && user.role !== "STUDENT") redirect("/staff");
  if (portal === "staff" && user.role === "STUDENT") redirect("/reports");
  return user;
}
