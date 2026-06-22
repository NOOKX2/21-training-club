"use client";

import { AdminChat } from "@/components/admin/AdminChat";
import { useAdminChatPage } from "@/lib/hooks/use-admin-page";
import { useSearchParams } from "next/navigation";

export function AdminChatPageView() {
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client") ?? undefined;
  const { data } = useAdminChatPage(clientParam);

  if (!data) return null;

  return (
    <AdminChat
      clients={data.clients}
      coaches={data.coaches}
      selectedClientId={data.selectedClientId}
      initialMessages={data.messages}
    />
  );
}
