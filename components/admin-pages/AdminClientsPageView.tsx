"use client";

import { ClientRoster } from "@/components/admin/ClientRoster";
import { useAdminClientsPage } from "@/lib/hooks/use-admin-page";

export function AdminClientsPageView() {
  const { data } = useAdminClientsPage();
  if (!data) return null;
  return <ClientRoster clients={data.clients} />;
}
