"use client";

import { BedDouble } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { clientCard } from "@/lib/client-ui";
import { cn } from "@/lib/utils";

export function RestDayCard({ className }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        clientCard,
        "flex flex-col items-center px-6 py-12 text-center sm:px-10 sm:py-14",
        className
      )}
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#6B93B8]/15 ring-1 ring-[#6B93B8]/30">
        <BedDouble className="h-11 w-11 text-[#A8C5DC]" strokeWidth={1.5} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6B93B8]">
        {t("workouts.restDayBadge")}
      </p>
      <h3 className="mt-3 font-[family-name:var(--font-inter)] text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
        {t("workouts.restDayTitle")}
      </h3>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55 sm:text-[15px]">
        {t("workouts.restDayMessage")}
      </p>
    </div>
  );
}
