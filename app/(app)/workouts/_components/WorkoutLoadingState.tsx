"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function WorkoutLoadingState() {
  const { t } = useLanguage();

  return (
    <div
      className="mt-6 flex min-h-[28vh] flex-col items-center justify-center gap-3 py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-[#6B93B8]" />
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
        {t("coach.loadingProgram")}
      </p>
    </div>
  );
}
