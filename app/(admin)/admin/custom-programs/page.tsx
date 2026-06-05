import { CustomPrograms } from "@/components/admin/CustomPrograms";
import { getAdminClients, getCustomProgram } from "@/lib/data";

export default async function AdminCustomProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; day?: string }>;
}) {
  const params = await searchParams;
  const clients = await getAdminClients();
  const selectedEmail =
    params.client && clients.some((c) => c.email === params.client)
      ? params.client
      : "";
  const day = Math.min(7, Math.max(1, parseInt(params.day ?? "1", 10) || 1));
  const { exercises } = selectedEmail
    ? await getCustomProgram(selectedEmail, day)
    : { exercises: [] };
  return (
    <CustomPrograms
      key={`${selectedEmail}-${day}`}
      clients={clients}
      selectedEmail={selectedEmail}
      day={day}
      initialExercises={exercises}
    />
  );
}
