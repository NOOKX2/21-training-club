"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { ClientPageHeader } from "@/components/ClientPageHeader";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { ExercisePickerCard } from "@/app/(app)/workouts/program/edit/exercises/_components/ExercisePickerCard";
import { clientField } from "@/lib/client-ui";
import type { ExercisePickerItem } from "@/lib/workout-exercise-picker";
import {
  availableExercisePickerTypes,
  editorHref,
  readExercisePickerContext,
  type ExercisePickerType,
  writeExercisePickerResult,
} from "@/lib/workout-exercise-picker";
import { cn } from "@/lib/utils";

function initialSelectedIds(programId: string, day: number) {
  const context = readExercisePickerContext();
  if (!context || context.programId !== programId || context.day !== day) {
    return [];
  }
  return context.existingVideoIds;
}

export function ExercisePickerClient({
  programId,
  day,
  exercises,
  focusId,
}: {
  programId: string;
  day: number;
  exercises: ExercisePickerItem[];
  focusId?: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ExercisePickerType | null>(null);
  const [selectedIds, setSelectedIds] = useState(() => initialSelectedIds(programId, day));
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const typeOptions = useMemo(
    () => availableExercisePickerTypes(exercises),
    [exercises]
  );

  const filtered = useMemo(() => {
    let list = exercises;
    if (typeFilter) {
      list = list.filter((exercise) => exercise.type === typeFilter);
    }
    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter((exercise) => exercise.name.toLowerCase().includes(term));
    }
    return list;
  }, [exercises, query, typeFilter]);

  const selectedCount = selectedIds.length;
  const backHref = editorHref(programId, day);

  useEffect(() => {
    if (!focusId) return;
    const node = cardRefs.current[focusId];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId, exercises]);

  function toggleExercise(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    );
  }

  function addToProgram() {
    writeExercisePickerResult({
      programId,
      day,
      selectedIds,
    });
    router.push(backHref);
  }

  return (
    <div className="mx-auto max-w-5xl pb-28">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("workouts.exercisePickerBack")}
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <ClientPageHeader
          eyebrow={t("workouts.programEditorEyebrow")}
          title={t("workouts.exercisePickerTitle")}
          subtitle={t("workouts.exercisePickerSubtitle", { day })}
          className="mb-0"
        />
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("workouts.exercisePickerSearch")}
            className={cn(
              "h-11 w-full pl-10 pr-3 text-sm text-white placeholder:text-white/35 focus:outline-none",
              clientField
            )}
          />
        </div>
      </div>

      {typeOptions.length > 0 ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setTypeFilter(null)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors",
              typeFilter === null
                ? "border-[#6B93B8] bg-[#6B93B8]/20 text-white"
                : "border-white/15 bg-black/30 text-white/55 hover:border-white/25 hover:text-white"
            )}
          >
            {t("workouts.exercisePickerFilterAll")}
          </button>
          {typeOptions.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors",
                typeFilter === type
                  ? "border-[#6B93B8] bg-[#6B93B8]/20 text-white"
                  : "border-white/15 bg-black/30 text-white/55 hover:border-white/25 hover:text-white"
              )}
            >
              {t(`workouts.exercisePickerTypes.${type}`)}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-black/25 px-6 py-16 text-center">
          <p className="text-sm text-white/45">{t("workouts.exercisePickerEmpty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((exercise) => (
            <ExercisePickerCard
              key={exercise.id}
              ref={(node) => {
                cardRefs.current[exercise.id] = node;
              }}
              exercise={exercise}
              selected={selectedIds.includes(exercise.id)}
              onToggle={() => toggleExercise(exercise.id)}
            />
          ))}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0a0f18]/95 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className="text-sm font-semibold text-white">
            {t("workouts.exercisePickerSelected", { count: selectedCount })}
          </p>
          <Button
            type="button"
            className="h-11 gap-2 bg-[#6B93B8] px-6 text-white hover:bg-[#5a82a7]"
            onClick={addToProgram}
          >
            <Plus className="h-4 w-4" />
            {t("workouts.exercisePickerAddToProgram")}
          </Button>
        </div>
      </div>
    </div>
  );
}
