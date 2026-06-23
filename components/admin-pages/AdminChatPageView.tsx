"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { preload, useSWRConfig } from "swr";
import { AdminChat } from "@/components/admin/AdminChat";
import {
  resolveAdminChatMessages,
  useAdminChatMessages,
  useAdminChatRoster,
} from "@/lib/hooks/use-admin-page";
import { adminChatMessagesKey } from "@/lib/admin-page-keys";
import { replaceAppUrl } from "@/lib/sync-url";
import { api } from "@/lib/api-client";

const fetcher = <T,>(path: string) => api<T>(path);

function initialClientId(
  clientParam: string | null,
  clients: { id: string }[]
) {
  if (clientParam && clients.some((c) => c.id === clientParam)) {
    return clientParam;
  }
  return clients[0]?.id ?? "";
}

export function AdminChatPageView() {
  const searchParams = useSearchParams();
  const { cache } = useSWRConfig();
  const { data: roster } = useAdminChatRoster();
  const [selectedClientId, setSelectedClientId] = useState("");
  const { data: messageData, isLoading: messagesLoading } =
    useAdminChatMessages(selectedClientId);

  useEffect(() => {
    if (!roster?.clients.length) return;
    setSelectedClientId((current) => {
      if (current && roster.clients.some((c) => c.id === current)) return current;
      return initialClientId(searchParams.get("client"), roster.clients);
    });
  }, [roster?.clients, searchParams]);

  useEffect(() => {
    if (!roster?.clients.length) return;
    for (const client of roster.clients) {
      void preload(adminChatMessagesKey(client.id), fetcher);
    }
  }, [roster?.clients]);

  const messages = useMemo(
    () => resolveAdminChatMessages(selectedClientId, messageData, cache),
    [selectedClientId, messageData, cache]
  );

  const onSelectClient = useCallback((clientId: string) => {
    setSelectedClientId(clientId);
    replaceAppUrl("/admin/chat", clientId ? { client: clientId } : {});
    if (clientId) {
      void preload(adminChatMessagesKey(clientId), fetcher);
    }
  }, []);

  if (!roster) return null;

  const resolvedClientId =
    selectedClientId && roster.clients.some((c) => c.id === selectedClientId)
      ? selectedClientId
      : initialClientId(searchParams.get("client"), roster.clients);

  return (
    <AdminChat
      clients={roster.clients}
      coaches={roster.coaches}
      selectedClientId={resolvedClientId}
      messages={messages ?? []}
      messagesLoading={Boolean(resolvedClientId) && messages === undefined && messagesLoading}
      onSelectClient={onSelectClient}
    />
  );
}
