import { ProfileClient } from "@/components/ProfileClient";
import {
  getAdminClientById,
  getLiftRecords,
  getUserProfilePhotoUrl,
  getUserTdee,
} from "@/lib/data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminClientProfilePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getAdminClientById(clientId);
  if (!client) notFound();

  const [records, profilePhotoUrl, tdee] = await Promise.all([
    getLiftRecords(clientId),
    getUserProfilePhotoUrl(clientId),
    getUserTdee(clientId),
  ]);

  return (
    <ProfileClient
      readOnly
      user={{
        id: client.id,
        name: client.name,
        email: client.email,
        tier_level: client.tier_level,
        created_at: client.created_at,
        access_expires_at: client.access_expires_at,
        profile_photo_url: profilePhotoUrl,
        tdee,
      }}
      initialRecords={records}
    />
  );
}
