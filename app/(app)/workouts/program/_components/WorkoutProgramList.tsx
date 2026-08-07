"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { ClientPageHeader } from "@/components/ClientPageHeader";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { WorkoutProgramListCard } from "@/app/(app)/workouts/program/_components/WorkoutProgramListCard";
import { clientCard } from "@/lib/client-ui";
import type {
  WorkoutProgramListFilter,
  WorkoutProgramListItem,
} from "@/lib/workout-program-shared";
import { cn } from "@/lib/utils";

function filterHref(filter: WorkoutProgramListFilter) {
  return filter === "all" ? "/workouts/program" : `/workouts/program?filter=${filter}`;
}

export function WorkoutProgramList({
  items,
  filter,
}: {
  items: WorkoutProgramListItem[];
  filter: WorkoutProgramListFilter;
}) {
  const { t } = useLanguage();

  const filters: { id: WorkoutProgramListFilter; label: string }[] = [
    { id: "all", label: t("workouts.programListFilterAll") },
    { id: "active", label: t("workouts.programListFilterActive") },
    { id: "drafts", label: t("workouts.programListFilterDrafts") },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/workouts"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white"
      >
        {t("workouts.backToWorkouts")}
      </Link>

      <ClientPageHeader
        eyebrow={t("workouts.programListEyebrow")}
        title={t("workouts.programListTitle")}
        subtitle={t("workouts.programListSubtitle")}
        className="mb-8"
        actions={
          <Link href="/workouts/program/edit?program=main&day=1">
            <Button
              type="button"
              className="h-11 gap-2 bg-[#6B93B8] px-5 text-white hover:bg-[#5a82a7]"
            >
              <Plus className="h-4 w-4" />
              {t("workouts.programListCreate")}
            </Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((entry) => {
          const active = filter === entry.id;
          return (
            <Link
              key={entry.id}
              href={filterHref(entry.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors",
                active
                  ? "border-[#6B93B8] bg-[#6B93B8] text-white"
                  : "border-white/15 text-white/55 hover:border-white/30 hover:text-white"
              )}
            >
              {entry.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className={cn(clientCard, "px-6 py-16 text-center")}>
          <p className="text-sm text-white/45">{t("workouts.programListEmpty")}</p>
          <Link href="/workouts/program/edit?program=main&day=1" className="mt-4 inline-block">
            <Button
              type="button"
              className="h-11 gap-2 bg-[#6B93B8] px-5 text-white hover:bg-[#5a82a7]"
            >
              <Plus className="h-4 w-4" />
              {t("workouts.programListCreate")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <WorkoutProgramListCard key={`program-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
