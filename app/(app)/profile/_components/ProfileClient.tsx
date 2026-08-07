"use client";

import { Pencil } from "lucide-react";
import { ClientPageHeader } from "@/components/ClientPageHeader";
import {
  AddFriendButton,
  AddFriendModal,
} from "@/app/(app)/profile/_components/AddFriendModal";
import { FitnessInterestsSection } from "@/app/(app)/profile/_components/FitnessInterestsSection";
import { FriendsSection } from "@/app/(app)/profile/_components/FriendsSection";
import { LiftVerifiedCelebration } from "@/app/(app)/profile/_components/LiftVerifiedCelebration";
import { ProfileInfoSection } from "@/app/(app)/profile/_components/ProfileInfoSection";
import { ProfileLiftsSection } from "@/app/(app)/profile/_components/ProfileLiftsSection";
import { ProfileToast } from "@/app/(app)/profile/_components/ProfileToast";
import { FieldLabel } from "@/components/ui/Input";
import { useLanguage } from "@/components/LanguageProvider";
import { useProfileClient } from "@/lib/hooks/use-profile-client";
import { clientCard, clientSectionLabel } from "@/lib/client-ui";
import type { LiftRecord } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ProfileClient({
  user,
  initialRecords,
  readOnly = false,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    tier_level: string;
    created_at?: string;
    access_expires_at?: string | null;
    profile_photo_url?: string | null;
    tdee?: number | null;
  };
  initialRecords: LiftRecord[];
  readOnly?: boolean;
}) {
  const { t, locale } = useLanguage();
  const profile = useProfileClient({ user, initialRecords, locale, t });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <ProfileToast message={profile.toast} onClose={() => profile.setToast(null)} />
      {!readOnly ? (
        <AddFriendModal
          open={profile.addFriendOpen}
          onClose={() => profile.setAddFriendOpen(false)}
          onSent={async (message) => {
            profile.showToast(message);
            await profile.loadSocial();
          }}
        />
      ) : null}

      {profile.verifiedCelebration ? (
        <LiftVerifiedCelebration
          exercise={profile.verifiedCelebration.exercise}
          weight={profile.verifiedCelebration.weight}
          verifiedDate={profile.verifiedCelebration.verifiedDate}
          onClose={() => profile.setVerifiedCelebration(null)}
        />
      ) : null}

      <ClientPageHeader
        eyebrow={t("profile.eyebrow")}
        title={t("profile.title")}
        subtitle={t("profile.subtitle")}
        actions={
          readOnly ? undefined : (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <AddFriendButton onClick={() => profile.setAddFriendOpen(true)} />
              {profile.editing ? (
                <button
                  type="button"
                  onClick={profile.cancelEditing}
                  disabled={profile.saving}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium uppercase tracking-wide text-white/45 hover:border-white/25 hover:text-white disabled:opacity-50"
                >
                  {t("profile.cancel")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  profile.editing ? void profile.saveProfile() : profile.startEditing()
                }
                disabled={profile.saving}
                className="flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-xs font-medium uppercase tracking-wide text-white hover:border-white/40 disabled:opacity-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                {profile.saving
                  ? t("common.saving")
                  : profile.editing
                    ? t("profile.saveProfile")
                    : t("profile.editProfile")}
              </button>
            </div>
          )
        }
      />

      {!readOnly ? (
        profile.socialLoading ? (
          <section className={cn(clientCard, "p-6 text-center text-sm text-white/45")}>
            Loading fitness interests…
          </section>
        ) : (
          <FitnessInterestsSection
            initialInterests={profile.fitnessInterests}
            onToast={profile.showToast}
            onSaved={(interests) => {
              profile.setFitnessInterests(interests);
              profile.loadSocial();
            }}
          />
        )
      ) : profile.fitnessInterests.length > 0 ? (
        <section className={cn(clientCard, "p-6")}>
          <p className={clientSectionLabel}>Fitness interests</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.fitnessInterests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <ProfileInfoSection
        name={profile.name}
        email={user.email}
        tdee={profile.tdee}
        userTdee={user.tdee ?? null}
        editing={profile.editing}
        message={profile.message}
        avatarSrc={profile.avatarSrc}
        profileSavedMessage={t("profile.profileSaved")}
        onNameChange={profile.setName}
        onTdeeChange={profile.setTdee}
        onPhotoSelect={(file) => void profile.onPhotoSelect(file)}
      />

      <ProfileLiftsSection
        records={profile.records}
        lifts={profile.lifts}
        readOnly={readOnly}
        locale={locale}
        onLiftChange={profile.onLiftChange}
        onSubmitLift={(exercise) => void profile.submitLift(exercise)}
      />

      <section className={cn(clientCard, "grid grid-cols-1 overflow-hidden p-0 sm:grid-cols-3")}>
        <div className={cn("border-b border-white/10 p-4 sm:border-b-0 sm:border-r sm:p-6")}>
          <FieldLabel>Current Tier</FieldLabel>
          <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{user.tier_level}</p>
        </div>
        <div className={cn("border-b border-white/10 p-4 sm:border-b-0 sm:border-r sm:p-6")}>
          <FieldLabel>Member Since</FieldLabel>
          <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{profile.memberSince}</p>
        </div>
        <div className="p-4 sm:p-6">
          <FieldLabel>Expiration</FieldLabel>
          <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{profile.expirationDate}</p>
        </div>
      </section>

      {!readOnly ? (
        profile.socialLoading ? (
          <section className={cn(clientCard, "p-6 text-center text-sm text-white/45")}>
            {t("profile.loadingSocial")}
          </section>
        ) : (
          <FriendsSection
            currentUserId={user.id}
            initialFriends={profile.friends}
            initialRequests={profile.friendRequests}
            myInterests={profile.fitnessInterests}
            onToast={profile.showToast}
            refreshKey={profile.socialRefreshKey}
          />
        )
      ) : null}
    </div>
  );
}
