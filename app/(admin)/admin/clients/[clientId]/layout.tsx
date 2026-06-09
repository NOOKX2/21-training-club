import { notFound } from "next/navigation";
import { AdminClientViewNav } from "@/components/admin/AdminClientViewNav";
import { LanguageProvider } from "@/components/LanguageProvider";
import { getAdminClientById } from "@/lib/data";

export default async function AdminClientViewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getAdminClientById(clientId);
  if (!client) notFound();

  return (
    <LanguageProvider>
      <div className="space-y-6">
        <AdminClientViewNav client={client} />
        {children}
      </div>
    </LanguageProvider>
  );
}
