"use client";

import { ProfileClient } from "@/components/ProfileClient";
import { useAppUser } from "@/components/AppUserProvider";
import { useProfilePage } from "@/lib/hooks/use-app-page";

export function ProfilePageView() {
  const appUser = useAppUser();
  const { data } = useProfilePage();

  const user = data?.user ?? {
    id: appUser.id,
    name: appUser.name,
    email: appUser.email,
    tier_level: appUser.tier_level,
    created_at: appUser.created_at,
    access_expires_at: appUser.access_expires_at ?? null,
    profile_photo_url: appUser.profile_photo_url ?? null,
    tdee: null,
  };

  return (
    <ProfileClient
      user={user}
      initialRecords={data?.records ?? []}
    />
  );
}
