import { AdminChat } from "@/components/admin/AdminChat";
import { getAdminClients, getCoaches, getMessages } from "@/lib/data";

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const params = await searchParams;
  const [clients, coaches] = await Promise.all([getAdminClients(), getCoaches()]);
  const selectedClientId =
    params.client && clients.some((c) => c.id === params.client)
      ? params.client
      : (clients[0]?.id ?? "");
  const coachId = coaches[0]?.id ?? "";
  const messages =
    selectedClientId && coachId
      ? await getMessages(selectedClientId, coachId)
      : [];
  return (
    <AdminChat
      clients={clients}
      coaches={coaches}
      selectedClientId={selectedClientId}
      initialMessages={messages}
    />
  );
}
