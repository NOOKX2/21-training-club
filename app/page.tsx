import { redirect } from "next/navigation";
import { homePathForRole } from "@/lib/routes";
import { getSessionUser } from "@/lib/session";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  redirect(homePathForRole(user.role));
}
