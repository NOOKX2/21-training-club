"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Pencil, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { api } from "@/lib/api-client";
import type { LiftRecord } from "@/lib/data";

const LIFT_EXERCISES = [
  "Chest Press",
  "Squat",
  "Hip Thrusts",
  "Long Run",
] as const;

function formatLiftDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatExpirationDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function recordFor(records: LiftRecord[], exercise: string) {
  return records.find((r) => r.exercise_name === exercise);
}

export function ProfileClient({
  user,
  initialRecords,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    tier_level: string;
    created_at?: string;
    access_expires_at?: string | null;
  };
  initialRecords: LiftRecord[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [lifts, setLifts] = useState<Record<string, string>>({});
  const [records, setRecords] = useState(initialRecords);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  const memberSince =
    user.created_at?.slice(0, 4) ?? new Date().getFullYear().toString();
  const expirationDate = formatExpirationDate(user.access_expires_at);

  async function saveProfile() {
    try {
      await api("update-profile", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setMessage("Profile saved");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function submitLift(exerciseName: string) {
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
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section className="border border-zinc-800 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage your account details
            </p>
          </div>
          <button
            type="button"
            onClick={() => (editing ? saveProfile() : setEditing(true))}
            className="flex items-center gap-2 border border-zinc-600 px-3 py-2 text-xs font-medium uppercase tracking-wide text-white hover:border-zinc-400"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </button>
        </div>

        <div className="mt-8 flex gap-6">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
            <User className="h-12 w-12 text-zinc-600" />
          </div>
          <div className="flex-1 space-y-5">
            <div>
              <FieldLabel>Full Name</FieldLabel>
              {editing ? (
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              ) : (
                <p className="text-lg font-bold uppercase text-white">{name}</p>
              )}
            </div>
            <div>
              <FieldLabel>Email Address</FieldLabel>
              <p className="text-lg text-white">{user.email}</p>
            </div>
          </div>
        </div>
        {message && (
          <p className="mt-4 text-sm text-[#a3e635]">{message}</p>
        )}
      </section>

      <section className="border border-zinc-800 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold uppercase text-white">
          <Award className="h-5 w-5 text-[#a3e635]" />
          My Top Lifts
        </h2>
        <div className="mt-6 space-y-6">
          {LIFT_EXERCISES.map((exercise) => {
            const record = recordFor(records, exercise);
            const verified = record?.verification_status === "Verified";
            const submittedDate = formatLiftDate(record?.submitted_at);
            return (
              <div key={exercise}>
                <p className="mb-2 text-sm font-bold uppercase text-white">
                  {exercise}
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter weight (kg)"
                    value={lifts[exercise] ?? ""}
                    onChange={(e) =>
                      setLifts((prev) => ({
                        ...prev,
                        [exercise]: e.target.value,
                      }))
                    }
                    disabled={verified}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="dark"
                    className="h-[46px] shrink-0 px-6 text-xs"
                    onClick={() => submitLift(exercise)}
                    disabled={verified || !lifts[exercise]}
                  >
                    Submit
                  </Button>
                </div>
                {record && submittedDate && (
                  <p className="mt-2 text-xs text-zinc-400">
                    Last submitted {submittedDate} · {record.weight_lifted} kg
                    {verified ? (
                      <span className="text-[#a3e635]"> · Verified</span>
                    ) : (
                      <span className="text-zinc-500"> · Pending review</span>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex border border-zinc-800">
        <div className="flex-1 border-r border-zinc-800 p-6">
          <FieldLabel>Current Tier</FieldLabel>
          <p className="mt-2 text-3xl font-bold text-white">{user.tier_level}</p>
        </div>
        <div className="flex-1 border-r border-zinc-800 p-6">
          <FieldLabel>Member Since</FieldLabel>
          <p className="mt-2 text-3xl font-bold text-white">{memberSince}</p>
        </div>
        <div className="flex-1 p-6">
          <FieldLabel>Expiration Date</FieldLabel>
          <p className="mt-2 text-3xl font-bold text-white">{expirationDate}</p>
        </div>
      </section>
    </div>
  );
}
