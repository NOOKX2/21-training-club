"use client";

import { useEffect, useState } from "react";
import { Dumbbell, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { api } from "@/lib/api-client";
import type { ProgramCardio } from "@/lib/program-cardio";
import type { WorkoutExercise } from "@/lib/data";
import { getProgramWeekDay } from "@/lib/program-schedule";
import { cn } from "@/lib/utils";

export type ProgramShareExercise = {
  id: string;
  name: string;
  target_sets: number;
  target_reps: string;
  image_url?: string;
  demo_video?: {
    id: string;
    video_url?: string;
    has_uploaded_file?: boolean;
    media_id?: string;
  };
};

export type ProgramShareDraft = {
  week: number;
  day: number;
  exercises: ProgramShareExercise[];
  cardio: ProgramCardio | null;
};

const WEEKS = [1, 2, 3, 4];
const DAYS = [1, 2, 3, 4, 5, 6, 7];

export function ExerciseProgramPickerModal({
  open,
  onClose,
  programStartDate,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  programStartDate: string;
  onConfirm: (draft: ProgramShareDraft) => void;
}) {
  const { t } = useLanguage();
  const defaults = getProgramWeekDay(programStartDate);
  const [week, setWeek] = useState(defaults.week);
  const [day, setDay] = useState(defaults.day);
  const [exercises, setExercises] = useState<ProgramShareExercise[]>([]);
  const [cardio, setCardio] = useState<ProgramCardio | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setWeek(defaults.week);
    setDay(defaults.day);
  }, [open, defaults.week, defaults.day]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    async function loadProgram() {
      setLoading(true);
      setError("");
      try {
        const data = await api<{
          exercises: WorkoutExercise[];
          cardio?: ProgramCardio | null;
          rest_day?: boolean;
        }>(`workouts/day/${week}/${day}`);
        if (cancelled) return;

        if (data.rest_day) {
          setExercises([]);
          setCardio(null);
          setSelectedIds(new Set());
          setError(t("coach.restDayNoExercises"));
          return;
        }

        const mapped = (data.exercises ?? []).map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          target_sets: exercise.target_sets,
          target_reps: exercise.target_reps,
          image_url: exercise.image_url,
          demo_video: exercise.demo_video
            ? {
                id: exercise.demo_video.id,
                video_url: exercise.demo_video.video_url,
                has_uploaded_file: exercise.demo_video.has_uploaded_file,
                media_id:
                  exercise.demo_video.media_items?.[0]?.id ??
                  (exercise.demo_video.has_uploaded_file ? "legacy" : undefined),
              }
            : undefined,
        }));
        setExercises(mapped);
        setCardio(data.cardio ?? null);
        setSelectedIds(new Set(mapped.map((exercise) => exercise.id)));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("coach.programLoadFailed"));
          setExercises([]);
          setCardio(null);
          setSelectedIds(new Set());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProgram();
    return () => {
      cancelled = true;
    };
  }, [open, week, day, t]);

  function toggleExercise(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    const picked = exercises.filter((exercise) => selectedIds.has(exercise.id));
    if (picked.length === 0) {
      setError(t("coach.pickAtLeastOneExercise"));
      return;
    }
    onConfirm({
      week,
      day,
      exercises: picked,
      cardio,
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[min(90dvh,40rem)] w-full max-w-lg flex-col overflow-hidden border border-zinc-700 bg-zinc-950 shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-[#6B93B8]" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white">
                {t("coach.sendProgram")}
              </p>
              <p className="text-[11px] text-zinc-500">{t("coach.sendProgramHint")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 hover:text-white"
            aria-label={t("common.remove")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {t("common.week")}
              </label>
              <select
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                className="w-full border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white"
              >
                {WEEKS.map((value) => (
                  <option key={value} value={value}>
                    {t("common.week")} {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {t("common.day")}
              </label>
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white"
              >
                {DAYS.map((value) => (
                  <option key={value} value={value}>
                    {t("common.day")} {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-zinc-500">{t("coach.loadingProgram")}</p>
          ) : (
            <div className="space-y-2">
              {exercises.length === 0 ? (
                <p className="rounded-xl border border-zinc-800 px-4 py-6 text-center text-sm text-zinc-500">
                  {t("coach.noExercisesThisDay")}
                </p>
              ) : (
                exercises.map((exercise) => {
                  const checked = selectedIds.has(exercise.id);
                  return (
                    <label
                      key={exercise.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                        checked
                          ? "border-[#6B93B8]/40 bg-[#6B93B8]/10"
                          : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExercise(exercise.id)}
                        className="mt-1 h-4 w-4 accent-[#6B93B8]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">{exercise.name}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {exercise.target_sets} {t("common.sets")} × {exercise.target_reps}{" "}
                          {t("common.reps")}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-zinc-800 px-4 py-4 sm:px-5">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            {t("profile.cancel")}
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleConfirm}
            disabled={loading || exercises.length === 0}
          >
            {t("coach.attachProgram")}
          </Button>
        </div>
      </div>
    </div>
  );
}
