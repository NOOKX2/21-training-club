import { AdminShell } from "@/app/(admin)/admin/_components/AdminShell";
import { buildAdminSwrFallback } from "@/lib/admin-swr-fallback";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const swrFallback = await buildAdminSwrFallback();
  return <AdminShell swrFallback={swrFallback}>{children}</AdminShell>;
}
