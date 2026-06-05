import { ClientRoster } from "@/components/admin/ClientRoster";
import { getAdminClients } from "@/lib/data";

export default async function AdminClientsPage() {
  const clients = await getAdminClients();
  return <ClientRoster clients={clients} />;
}
