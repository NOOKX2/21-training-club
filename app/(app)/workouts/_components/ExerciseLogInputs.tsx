"use client";

import { Check } from "lucide-react";
import type { ExerciseLogState } from "@/app/(app)/workouts/_components/types";
import { StepperInput } from "@/components/StepperInput";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";

function SetStepperInput({
  prefix,
  value,
  onChange,
  min = 0,
  step = 1,
  inputMode = "decimal",
}: {
  prefix: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  step?: number;
  inputMode?: "decimal" | "numeric";
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[10px] border border-white/10 bg-black/40 py-1 pl-2.5 pr-1 sm:gap-2 sm:pl-3">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-white/35">
        {prefix}
      </span>
      <StepperInput
        compact
        className="min-w-0 flex-1 border-0 bg-transparent"
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        inputMode={inputMode}
      />
    </div>
  );
}

export function ExerciseLogInputs({
  log,
  completedSets,
  onUpdateSet,
  onToggleSetComplete,
  onAddSet,
}: {
  log?: ExerciseLogState;
  completedSets: boolean[];
  onUpdateSet: (setIndex: number, field: "weight" | "reps", value: string) => void;
  onToggleSetComplete: (setIndex: number) => void;
  onAddSet: () => void;
}) {
  const { t } = useLanguage();
  const sets = log?.sets ?? [];

  return (
    <div className="space-y-2.5">
      {sets.map((set, setIndex) => {
        const complete = completedSets[setIndex] ?? false;
        return (
          <div key={setIndex} className="flex items-center gap-2 sm:gap-3">
            <span className="w-4 shrink-0 text-center text-sm font-bold text-white/70">
              {setIndex + 1}
            </span>
            <SetStepperInput
              prefix={t("common.kg")}
              value={set.weight}
              onChange={(weight) => onUpdateSet(setIndex, "weight", weight)}
              min={0}
              step={1}
            />
            <SetStepperInput
              prefix={t("common.reps")}
              value={set.reps}
              onChange={(reps) => onUpdateSet(setIndex, "reps", reps)}
              min={0}
              step={1}
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={() => onToggleSetComplete(setIndex)}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                complete
                  ? "border-[#6B93B8] bg-[#6B93B8] text-white"
                  : "border-white/20 bg-white/5 text-transparent hover:border-white/35"
              )}
              aria-label={`${t("common.set")} ${setIndex + 1} ${complete ? "complete" : "incomplete"}`}
              aria-pressed={complete}
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAddSet}
        className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#A8C5DC] transition-colors hover:text-white"
      >
        + {t("workouts.addSet")}
      </button>
    </div>
  );
}
