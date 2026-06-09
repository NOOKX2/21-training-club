import { AdminChat } from "@/components/admin/AdminChat";
import { getAdminClientsForChat, getCoaches, getMessages } from "@/lib/data";

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const params = await searchParams;
  const coaches = await getCoaches();
  const coachId = coaches[0]?.id ?? "";
  const clients = await getAdminClientsForChat(coachId);
  const selectedClientId =
    params.client && clients.some((c) => c.id === params.client)
      ? params.client
      : (clients[0]?.id ?? "");
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
