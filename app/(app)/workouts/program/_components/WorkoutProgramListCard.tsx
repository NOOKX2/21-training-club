"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { Calendar, Clock, Eye, Pencil, Power, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { clientBackgroundImage, clientCard } from "@/lib/client-ui";
import { api } from "@/lib/api-client";
import { CLIENT_WORKOUT_LOG_WEEK, workoutWeekKey } from "@/lib/app-page-keys";
import type { WorkoutProgramListItem } from "@/lib/workout-program-shared";
import { DEFAULT_WORKOUT_PROGRAM_ID } from "@/lib/workout-program-shared";
import { cn } from "@/lib/utils";

function relativeUpdatedLabel(
  iso: string | null,
  t: (key: string, vars?: Record<string, string | number>) => string
): string {
  if (!iso) return t("workouts.programListNotUpdated");
  const updated = new Date(iso);
  if (Number.isNaN(updated.getTime())) return t("workouts.programListNotUpdated");

  const diffMs = Date.now() - updated.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return t("workouts.programListUpdatedToday");
  if (diffDays === 1) return t("workouts.programListUpdatedYesterday");
  return t("workouts.programListUpdatedDaysAgo", { days: diffDays });
}

function programDisplayName(item: WorkoutProgramListItem, t: (key: string) => string) {
  if (item.name.trim()) return item.name.trim();
  return t("workouts.programEditorTitle");
}

function tagLabel(tag: string, t: (key: string) => string) {
  if (tag === "7d") return t("workouts.programListTag7Days");
  if (tag === "strength") return t("workouts.programListTagStrength");
  if (tag === "template") return t("workouts.programListTagTemplate");
  if (tag === "empty") return t("workouts.programListTagDraft");
  return tag;
}

export function WorkoutProgramListCard({ item }: { item: WorkoutProgramListItem }) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { t } = useLanguage();
  const [isEnabled, setIsEnabled] = useState(item.isEnabled);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState("");

  const status = !item.hasContent
    ? "draft"
    : isEnabled
      ? "enabled"
      : "disabled";

  async function toggleEnabled() {
    if (!item.hasContent || toggling) return;
    const nextEnabled = !isEnabled;
    setToggling(true);
    setError("");
    try {
      await api<{ program_id: string; enabled: boolean }>("workouts/my-program/status", {
        method: "PUT",
        body: JSON.stringify({
          program_id: item.id,
          enabled: nextEnabled,
        }),
      });
      setIsEnabled(nextEnabled);
      void mutate(workoutWeekKey(CLIENT_WORKOUT_LOG_WEEK));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.saveFailed"));
    } finally {
      setToggling(false);
    }
  }

  async function deleteProgram() {
    if (deleting) return;
    const confirmMessage =
      item.id === DEFAULT_WORKOUT_PROGRAM_ID
        ? t("workouts.programListDeleteConfirmMain")
        : t("workouts.programListDeleteConfirm");
    if (!window.confirm(confirmMessage)) return;

    setDeleting(true);
    setError("");
    try {
      await api<{ program_id: string; reset: boolean }>(
        `workouts/programs/${item.id}`,
        { method: "DELETE" }
      );
      if (item.id === DEFAULT_WORKOUT_PROGRAM_ID) {
        setIsEnabled(false);
      } else {
        setRemoved(true);
      }
      void mutate(workoutWeekKey(CLIENT_WORKOUT_LOG_WEEK));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.saveFailed"));
    } finally {
      setDeleting(false);
    }
  }

  if (removed) return null;

  return (
    <article className={cn(clientCard, "overflow-hidden transition-colors hover:border-white/20")}>
      <div
        className="relative h-36 bg-cover bg-center"
        style={{ backgroundImage: `url(${clientBackgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
        <span
          className={cn(
            "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            status === "enabled"
              ? "bg-emerald-500/20 text-emerald-300"
              : status === "disabled"
                ? "bg-white/10 text-white/55"
                : "bg-white/15 text-white/70"
          )}
        >
          {status === "enabled"
            ? t("workouts.programListStatusActive")
            : status === "disabled"
              ? t("workouts.programListStatusInactive")
              : t("workouts.programListStatusDraft")}
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <h2 className="font-[family-name:var(--font-inter)] text-lg font-extrabold tracking-[-0.03em] text-white">
            {programDisplayName(item, t)}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {t("workouts.programListDuration")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {relativeUpdatedLabel(item.updatedAt, t)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/55"
            >
              {tagLabel(tag, t)}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Link href={item.editHref} className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full gap-1.5 border-white/15 text-xs font-bold uppercase tracking-wide text-white hover:bg-white/10"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("workouts.programListEdit")}
            </Button>
          </Link>
          <Link href={item.viewHref}>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-10 border-white/15 p-0 text-white hover:bg-white/10"
              aria-label={t("workouts.programListView")}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-10 border-white/15 p-0 text-red-300 hover:border-red-400/30 hover:bg-red-400/10"
            aria-label={t("workouts.programListDelete")}
            disabled={deleting}
            onClick={() => void deleteProgram()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-10 w-full gap-1.5 text-xs font-bold uppercase tracking-wide",
            isEnabled
              ? "border-red-400/30 text-red-300 hover:bg-red-400/10"
              : "border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10"
          )}
          disabled={!item.hasContent || toggling}
          onClick={() => void toggleEnabled()}
        >
          <Power className="h-3.5 w-3.5" />
          {toggling
            ? t("common.saving")
            : isEnabled
              ? t("workouts.programListDisable")
              : t("workouts.programListEnable")}
        </Button>

        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>
    </article>
  );
}
