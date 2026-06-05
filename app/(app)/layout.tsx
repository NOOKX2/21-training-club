import { AppShell } from "@/components/AppShell";
import { requireAppUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAppUser();
  return <AppShell user={user}>{children}</AppShell>;
}
