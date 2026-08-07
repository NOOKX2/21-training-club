"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { markFriendRequestNotificationsRead } from "@/components/NotificationBell";
import type { FriendRequestItem, ProfileFriend } from "@/app/(app)/profile/_components/FriendsSection";
import { api } from "@/lib/api-client";
import type { FitnessInterest } from "@/lib/fitness-interests";
import type { LiftRecord } from "@/lib/data";
import { formatLocaleDate } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/types";
import { readImageDataUrl } from "@/lib/file-upload";

export function useProfileClient({
  user,
  initialRecords,
  locale,
  t,
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
  locale: Locale;
  t: (key: string) => string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user.name);
  const [tdee, setTdee] = useState(user.tdee != null ? String(user.tdee) : "");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(user.profile_photo_url ?? "");
  const [photoPreview, setPhotoPreview] = useState("");
  const [lifts, setLifts] = useState<Record<string, string>>({});
  const [records, setRecords] = useState(initialRecords);
  const [message, setMessage] = useState("");
  const [verifiedCelebration, setVerifiedCelebration] = useState<{
    exercise: string;
    weight: number;
    verifiedDate: string | null;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [socialLoading, setSocialLoading] = useState(true);
  const [fitnessInterests, setFitnessInterests] = useState<FitnessInterest[]>([]);
  const [friends, setFriends] = useState<ProfileFriend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestItem[]>([]);
  const [socialRefreshKey, setSocialRefreshKey] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const loadSocial = useCallback(async () => {
    setSocialLoading(true);
    try {
      const social = await api<{
        fitness_interests: FitnessInterest[];
        friends: ProfileFriend[];
        pending_requests: FriendRequestItem[];
      }>("friends/social");
      setFitnessInterests(social.fitness_interests);
      setFriends(social.friends);
      setFriendRequests(social.pending_requests);
      setSocialRefreshKey((key) => key + 1);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not load social profile");
    } finally {
      setSocialLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSocial();
  }, [loadSocial]);

  useEffect(() => {
    markFriendRequestNotificationsRead().catch(() => undefined);
  }, []);

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  useEffect(() => {
    for (const record of records) {
      if (record.verification_status !== "Verified") continue;
      const notifyKey = `lift-verified-${record.id}-${record.verified_at ?? record.submitted_at ?? "legacy"}`;
      if (typeof window === "undefined" || localStorage.getItem(notifyKey)) continue;
      localStorage.setItem(notifyKey, "1");
      setVerifiedCelebration({
        exercise: record.exercise_name,
        weight: record.weight_lifted,
        verifiedDate: formatLocaleDate(record.verified_at ?? record.submitted_at, locale),
      });
      break;
    }
  }, [records, locale]);

  useEffect(() => {
    setProfilePhotoUrl(user.profile_photo_url ?? "");
  }, [user.profile_photo_url]);

  useEffect(() => {
    if (!editing) {
      setName(user.name);
      setTdee(user.tdee != null ? String(user.tdee) : "");
    }
  }, [user.name, user.tdee, editing]);

  const avatarSrc = photoPreview || profilePhotoUrl;
  const memberSince = user.created_at?.slice(0, 4) ?? new Date().getFullYear().toString();
  const expirationDate = formatLocaleDate(user.access_expires_at, locale) ?? "—";

  const saveProfile = useCallback(async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await api<{
        message: string;
        name?: string;
        tdee?: number | null;
        profile_photo_url?: string | null;
      }>("update-profile", {
        method: "POST",
        body: JSON.stringify({
          name,
          tdee: tdee.trim() ? Number(tdee) : null,
          ...(photoPreview ? { profile_photo_base64: photoPreview } : {}),
        }),
      });
      if (res.profile_photo_url) setProfilePhotoUrl(res.profile_photo_url);
      setPhotoPreview("");
      setMessage(t("profile.profileSaved"));
      setEditing(false);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [name, photoPreview, router, t, tdee]);

  const startEditing = useCallback(() => {
    setEditing(true);
    setMessage("");
  }, []);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    setName(user.name);
    setTdee(user.tdee != null ? String(user.tdee) : "");
    setPhotoPreview("");
    setMessage("");
  }, [user.name, user.tdee]);

  const onPhotoSelect = useCallback(async (file: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await readImageDataUrl(file);
      setPhotoPreview(dataUrl);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not read photo");
    }
  }, []);

  const submitLift = useCallback(
    async (exerciseName: string) => {
      const w = lifts[exerciseName];
      if (!w) return;
      try {
        const saved = await api<LiftRecord>("lift-progress", {
          method: "POST",
          body: JSON.stringify({
            user_id: user.id,
            exercise_name: exerciseName,
            weight_lifted: Number(w),
          }),
        });
        setRecords((prev) => {
          const rest = prev.filter((r) => r.exercise_name !== exerciseName);
          return [...rest, saved];
        });
        setMessage(`Submitted ${exerciseName} for coach review`);
        setLifts((prev) => ({ ...prev, [exerciseName]: "" }));
        router.refresh();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Submit failed");
      }
    },
    [lifts, router, user.id]
  );

  const onLiftChange = useCallback((exercise: string, value: string) => {
    setLifts((prev) => ({ ...prev, [exercise]: value }));
  }, []);

  return {
    editing,
    saving,
    name,
    setName,
    tdee,
    setTdee,
    avatarSrc,
    message,
    verifiedCelebration,
    setVerifiedCelebration,
    toast,
    setToast,
    addFriendOpen,
    setAddFriendOpen,
    socialLoading,
    fitnessInterests,
    setFitnessInterests,
    friends,
    friendRequests,
    socialRefreshKey,
    showToast,
    loadSocial,
    memberSince,
    expirationDate,
    records,
    lifts,
    saveProfile,
    startEditing,
    cancelEditing,
    onPhotoSelect,
    submitLift,
    onLiftChange,
  };
}
