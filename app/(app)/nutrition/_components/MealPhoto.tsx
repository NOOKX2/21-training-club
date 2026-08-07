"use client";

import Link from "next/link";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";
import type { MealSubmission } from "@/lib/data";
import { browserDisplayableImageSrc } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

export function MealPhoto({
  meal,
  className,
  unsupportedLabel,
}: {
  meal: MealSubmission;
  className?: string;
  unsupportedLabel: string;
}) {
  const src = browserDisplayableImageSrc(meal.photo_base64);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={`Meal ${meal.meal_number}`} className={className} />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-black/40 px-2 text-center text-white/30",
        className
      )}
    >
      {meal.photo_base64 ? unsupportedLabel : "No photo"}
    </div>
  );
}

export function MealActionLinks({
  mealId,
  editNutritionLabel,
  promptAgainLabel,
  deleteMealLabel,
  deletingMealLabel,
  deleting,
  onDelete,
}: {
  mealId: string;
  editNutritionLabel: string;
  promptAgainLabel: string;
  deleteMealLabel: string;
  deletingMealLabel: string;
  deleting: boolean;
  onDelete: () => void;
}) {
  const linkClass =
    "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/45 transition-colors hover:text-white sm:text-xs";

  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      <Link href={`/nutrition/edit/${mealId}`} className={linkClass}>
        <Pencil className="h-3 w-3" />
        {editNutritionLabel}
      </Link>
      <Link href={`/nutrition/reprompt/${mealId}`} className={linkClass}>
        <RefreshCw className="h-3 w-3" />
        {promptAgainLabel}
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className={`${linkClass} hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <Trash2 className="h-3 w-3" />
        {deleting ? deletingMealLabel : deleteMealLabel}
      </button>
    </div>
  );
}
