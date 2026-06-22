"use client";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAdminDashboardPage } from "@/lib/hooks/use-admin-page";

export function AdminDashboardPageView() {
  const { data } = useAdminDashboardPage();
  if (!data) return null;
  return <AdminDashboard stats={data.stats} activity={data.activity} />;
}
