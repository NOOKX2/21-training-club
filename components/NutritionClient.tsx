"use client";

import { NutritionHeader } from "@/components/NutritionHeader";
import type { MealSubmission } from "@/lib/data";

export function NutritionClient({ meals }: { meals: MealSubmission[] }) {
  return (
    <div className="space-y-0">
      <NutritionHeader />

      <div className="mt-12 min-h-[200px] border border-zinc-800">
        {meals.length === 0 ? (
          <p className="p-8 text-center text-zinc-500">
            No meals logged today. Tap + Add Meal to submit to your coach.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {meals.map((m) => (
              <li key={m.id} className="flex gap-4 px-6 py-4">
                {m.photo_base64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photo_base64}
                    alt={`Meal ${m.meal_number}`}
                    className="h-24 w-24 shrink-0 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-zinc-900 text-xs text-zinc-600">
                    No photo
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold uppercase text-white">
                    Meal {m.meal_number}
                    {m.custom_name ? ` — ${m.custom_name}` : ""}
                  </p>
                  {m.description && (
                    <p className="mt-1 text-sm text-zinc-400">{m.description}</p>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">
                    {m.coach_reviewed ? "Reviewed by coach" : "Pending coach review"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
