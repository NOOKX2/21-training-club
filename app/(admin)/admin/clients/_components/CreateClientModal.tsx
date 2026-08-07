"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { api } from "@/lib/api-client";
import type { Gender } from "@/lib/access";
import type { AdminClient } from "@/lib/data";
import {
  MEMBERSHIP_DURATION_OPTIONS,
  computeAccessExpiry,
  type MembershipDurationValue,
} from "@/lib/membership-duration";

const TIER_OPTIONS = [
  { value: "Tier 1", label: "Tier 1 - The Engine" },
  { value: "Tier 2", label: "Tier 2 - The Builder" },
  { value: "Tier 3", label: "Tier 3 - VIP" },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

function todayDateInput(): string {
  return new Date().toISOString().slice(0, 10);
}

function generatePassword() {
  return Math.random().toString(36).slice(2, 10) + "A1!";
}

export function CreateClientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: (client: AdminClient) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    tier_level: "Tier 1",
    gender: "prefer_not_to_say" as Gender,
    membership_duration: "" as MembershipDurationValue,
    access_starts_at: todayDateInput(),
    access_expires_at: "",
    tdee: "",
  });

  function applyDuration(
    duration: MembershipDurationValue,
    startsAt: string
  ): string {
    if (duration === "none") return "";
    if (duration === "custom" || !duration) return form.access_expires_at;
    return computeAccessExpiry(startsAt, duration);
  }

  function setMembershipDuration(duration: MembershipDurationValue) {
    setForm((current) => ({
      ...current,
      membership_duration: duration,
      access_expires_at: applyDuration(duration, current.access_starts_at),
    }));
  }

  function setAccessStartsAt(startsAt: string) {
    setForm((current) => {
      const duration = current.membership_duration;
      const expiresAt =
        duration && duration !== "custom" && duration !== "none"
          ? computeAccessExpiry(startsAt, duration)
          : current.access_expires_at;
      return { ...current, access_starts_at: startsAt, access_expires_at: expiresAt };
    });
  }

  function setAccessExpiresAt(expiresAt: string) {
    setForm((current) => ({
      ...current,
      membership_duration: expiresAt ? "custom" : "none",
      access_expires_at: expiresAt,
    }));
  }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<AdminClient & { message?: string }>("admin/create-client", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          access_expires_at: form.access_expires_at || null,
          tdee: form.tdee ? Number(form.tdee) : null,
        }),
      });
      onCreated?.({
        id: res.id,
        email: res.email,
        name: res.name,
        tier_level: res.tier_level,
        gender: res.gender ?? form.gender,
        access_starts_at: res.access_starts_at ?? form.access_starts_at,
        access_expires_at:
          res.access_expires_at ?? (form.access_expires_at || null),
        tdee: res.tdee ?? (form.tdee ? Number(form.tdee) : null),
        created_at: new Date().toISOString(),
      });
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-zinc-700 bg-zinc-950 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wide text-white">
            Create New Client
          </h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <FieldLabel>Full Name</FieldLabel>
            <Input
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <FieldLabel>Email Address</FieldLabel>
            <Input
              type="email"
              placeholder="client@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 text-xs"
                onClick={() => setForm({ ...form, password: generatePassword() })}
              >
                Generate
              </Button>
            </div>
          </div>
          <div>
            <FieldLabel>Gender</FieldLabel>
            <select
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as Gender })
              }
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Tier Level</FieldLabel>
            <select
              value={form.tier_level}
              onChange={(e) => setForm({ ...form, tier_level: e.target.value })}
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
            >
              {TIER_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>TDEE (kcal / day)</FieldLabel>
            <Input
              type="number"
              min={1}
              value={form.tdee}
              onChange={(e) => setForm({ ...form, tdee: e.target.value })}
              placeholder="e.g. 2200"
            />
          </div>

          <div>
            <FieldLabel>Membership Duration</FieldLabel>
            <select
              value={form.membership_duration}
              onChange={(e) =>
                setMembershipDuration(e.target.value as MembershipDurationValue)
              }
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
            >
              {MEMBERSHIP_DURATION_OPTIONS.map((opt) => (
                <option key={opt.value || "default"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-zinc-600">
              Picks expiry from Access Starts — or choose Custom / No expiry
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Access Starts</FieldLabel>
              <Input
                type="date"
                value={form.access_starts_at}
                onChange={(e) => setAccessStartsAt(e.target.value)}
                required
              />
            </div>
            <div>
              <FieldLabel>Access Expires</FieldLabel>
              <Input
                type="date"
                value={form.access_expires_at}
                onChange={(e) => setAccessExpiresAt(e.target.value)}
                disabled={
                  form.membership_duration !== "" &&
                  form.membership_duration !== "custom"
                }
              />
              <p className="mt-1 text-[10px] text-zinc-600">
                {form.membership_duration === "custom" || !form.membership_duration
                  ? "Leave empty for no expiry"
                  : "Auto-filled from duration"}
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              Create Client
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
