import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminRecentActivity, getAdminStats } from "@/lib/data";

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([
    getAdminStats(),
    getAdminRecentActivity(),
  ]);
  return <AdminDashboard stats={stats} activity={activity} />;
}
