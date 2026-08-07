"use client";

import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";

export function WorkoutSaveBar({
  completedSets,
  totalSets,
  saving,
  saved,
  errorMessage,
  onSave,
}: {
  completedSets: number;
  totalSets: number;
  saving: boolean;
  saved: boolean;
  errorMessage?: string;
  onSave: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-white/10 bg-[#0d0d0d]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:bottom-0">
      <div className="mx-auto flex max-w-[900px] items-center justify-between gap-4">
        <p className="text-sm text-white/55">
          {t("workouts.setsProgress", { completed: completedSets, total: totalSets })}
        </p>
        <Button
          type="button"
          variant="save"
          className={cn(
            "h-11 shrink-0 gap-2 rounded-xl border-[#6B93B8] bg-[#6B93B8] px-5 text-[12px] font-bold tracking-wide text-white hover:bg-[#5a82a7] hover:text-white sm:px-6 sm:text-[13px]",
            saved && "border-white bg-white text-black hover:bg-white hover:text-black"
          )}
          onClick={onSave}
          disabled={saving || totalSets === 0}
        >
          <CheckCheck className="h-4 w-4 shrink-0" />
          {saving ? t("common.saving") : saved ? t("common.saved") : t("workouts.saveWorkout")}
        </Button>
      </div>
      {errorMessage ? (
        <p className="mx-auto mt-2 max-w-[900px] text-xs text-red-400">{errorMessage}</p>
      ) : null}
    </div>
  );
}
