"use client";

import { useRef } from "react";
import { ClipboardCheck } from "lucide-react";
import { ExerciseDemoMedia } from "@/app/(app)/workouts/_components/ExerciseDemoMedia";
import { ExerciseLogInputs } from "@/app/(app)/workouts/_components/ExerciseLogInputs";
import type { ExerciseLogState } from "@/app/(app)/workouts/_components/types";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";
import type { FormCheckSubmission, WorkoutExercise } from "@/lib/data";
import { clientCard } from "@/lib/client-ui";
import { MOBILE_FILE_INPUT_CLASS } from "@/lib/file-upload";
import { cn } from "@/lib/utils";

export function WorkoutExerciseCard({
  exercise,
  log,
  previousWeight,
  completedSets,
  formCheck,
  uploadingFormCheck,
  formCheckLabel,
  message,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSetComplete,
  onFormCheckSelect,
}: {
  exercise: WorkoutExercise;
  log?: ExerciseLogState;
  previousWeight?: string | null;
  completedSets: boolean[];
  formCheck?: FormCheckSubmission;
  uploadingFormCheck: boolean;
  formCheckLabel: string;
  message?: string;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: "weight" | "reps", value: string) => void;
  onToggleSetComplete: (setIndex: number) => void;
  onFormCheckSelect: (file: File | null) => void;
}) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasMedia = Boolean(
    exercise.demo_video?.media_items?.length || exercise.demo_video || exercise.image_url
  );

  return (
    <div className={cn(clientCard, "w-full px-5 py-5 sm:px-6 sm:py-6")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-[family-name:var(--font-inter)] text-lg font-extrabold tracking-[-0.03em] text-white">
          {exercise.name}
        </h3>
        {previousWeight ? (
          <span className="rounded-full border border-[#6B93B8]/40 bg-[#6B93B8]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#A8C5DC]">
            {t("workouts.lastWeekWeight", { weight: previousWeight })}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[13px] text-white/45">
        {t("common.target")}:{" "}
        {t("workouts.targetLine", {
          sets: exercise.target_sets,
          reps: exercise.target_reps,
        })}
      </p>

      <div className="mt-5 flex min-w-0 items-start gap-2 sm:gap-3">
        {hasMedia ? (
          <div className="shrink-0">
            <ExerciseDemoMedia exercise={exercise} />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <ExerciseLogInputs
            log={log}
            completedSets={completedSets}
            onAddSet={onAddSet}
            onRemoveSet={onRemoveSet}
            onUpdateSet={onUpdateSet}
            onToggleSetComplete={onToggleSetComplete}
          />
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className={MOBILE_FILE_INPUT_CLASS}
          aria-hidden
          tabIndex={-1}
          onChange={(e) => {
            onFormCheckSelect(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-1.5 border-white/15 text-[11px] font-bold uppercase tracking-wide text-white/80 hover:bg-white/10"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingFormCheck}
        >
          <ClipboardCheck className="h-4 w-4 shrink-0" />
          <span className="truncate">{formCheckLabel}</span>
        </Button>
      </div>

      {formCheck?.status === "reviewed" && formCheck.feedback_text ? (
        <p className="mt-2 text-xs text-[#A8C5DC]">{t("workouts.coachFeedbackChat")}</p>
      ) : null}
      {message ? (
        <p
          className={cn(
            "mt-2 text-xs",
            message.includes("uploaded") || message.includes("coach")
              ? "text-[#A8C5DC]"
              : "text-red-400"
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
