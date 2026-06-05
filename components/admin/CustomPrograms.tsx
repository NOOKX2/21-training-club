"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2, User } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { api } from "@/lib/api-client";
import type { AdminClient, ProgramExercise } from "@/lib/data";

export function CustomPrograms({
  clients,
  selectedEmail,
  day,
  initialExercises,
}: {
  clients: AdminClient[];
  selectedEmail: string;
  day: number;
  initialExercises: ProgramExercise[];
}) {
  const router = useRouter();
  const [exercises, setExercises] = useState<ProgramExercise[]>(
    initialExercises.length > 0
      ? initialExercises
      : []
  );
  const [saving, setSaving] = useState(false);

  const selected = clients.find((c) => c.email === selectedEmail);

  function navigate(email: string, nextDay: number) {
    const params = new URLSearchParams();
    if (email) params.set("client", email);
    params.set("day", String(nextDay));
    router.push(`/admin/custom-programs?${params.toString()}`);
  }

  function addExercise() {
    setExercises([
      ...exercises,
      { id: uuidv4(), name: "", target_sets: 3, target_reps: "8-12" },
    ]);
  }

  async function save() {
    if (!selectedEmail) return;
    setSaving(true);
    try {
      await api("admin/custom-programs", {
        method: "POST",
        body: JSON.stringify({
          client_email: selectedEmail,
          day,
          exercises,
        }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wide text-white">
          Custom Programs
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Assign personalized exercises to individual clients
        </p>
      </div>

      <div className="border border-zinc-800 p-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          <User className="h-4 w-4" />
          Select Client
        </div>
        <select
          value={selectedEmail}
          onChange={(e) => navigate(e.target.value, day)}
          className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
        >
          <option value="">Choose a client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.email}>
              {c.name} ({c.email}) - {c.tier_level}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="border border-zinc-800 p-6">
          <div className="mb-4 grid max-w-xs grid-cols-1 gap-4">
            <div>
              <FieldLabel>Day</FieldLabel>
              <select
                value={day}
                onChange={(e) => navigate(selectedEmail, Number(e.target.value))}
                className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase text-white">
              Exercises for {selected.name}
            </h2>
            <Button
              type="button"
              className="h-9 gap-1 bg-[#a3e635] text-xs text-black"
              onClick={addExercise}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Exercise
            </Button>
          </div>

          {exercises.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No custom exercises yet. Add exercises for this client.
            </p>
          ) : (
            <div className="space-y-3">
              {exercises.map((ex) => (
                <div key={ex.id} className="flex gap-3">
                  <Input
                    placeholder="Exercise name"
                    value={ex.name}
                    onChange={(e) =>
                      setExercises(
                        exercises.map((x) =>
                          x.id === ex.id ? { ...x, name: e.target.value } : x
                        )
                      )
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Sets"
                    value={ex.target_sets}
                    onChange={(e) =>
                      setExercises(
                        exercises.map((x) =>
                          x.id === ex.id
                            ? { ...x, target_sets: Number(e.target.value) }
                            : x
                        )
                      )
                    }
                    className="w-20"
                  />
                  <Input
                    placeholder="Reps"
                    value={ex.target_reps}
                    onChange={(e) =>
                      setExercises(
                        exercises.map((x) =>
                          x.id === ex.id ? { ...x, target_reps: e.target.value } : x
                        )
                      )
                    }
                    className="w-24"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setExercises(exercises.filter((x) => x.id !== ex.id))
                    }
                    className="flex h-[46px] w-10 items-center justify-center bg-red-900/40 text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {exercises.length > 0 && (
            <Button
              type="button"
              className="mt-6 h-11 w-full gap-2 bg-[#a3e635] text-black"
              onClick={save}
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              Save Custom Program
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
