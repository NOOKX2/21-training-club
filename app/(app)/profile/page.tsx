import { ProfileClient } from "@/components/ProfileClient";
import { getLiftRecords } from "@/lib/data";
import { requireAppUser } from "@/lib/session";

export default async function ProfilePage() {
  const user = await requireAppUser();
  const records = await getLiftRecords(user.id);
  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        tier_level: user.tier_level,
        created_at: user.created_at,
        access_expires_at: user.access_expires_at,
      }}
      initialRecords={records}
    />
  );
}
