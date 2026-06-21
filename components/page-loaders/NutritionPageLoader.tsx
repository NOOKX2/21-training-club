"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NutritionClient } from "@/components/NutritionClient";
import { AppPageSkeleton } from "@/components/AppPageSkeleton";
import { useAppUser } from "@/components/AppUserProvider";
import { api } from "@/lib/api-client";
import type { DailyNutritionScore, MealSubmission, NutritionLimits } from "@/lib/data";
import { localDateKey } from "@/lib/date-utils";

type NutritionPageData = {
  meals: MealSubmission[];
  scoreTrend: DailyNutritionScore[];
  limits: NutritionLimits;
  selectedDate: string;
  isToday: boolean;
};

function parseNutritionDate(raw: string | null): string {
  const today = localDateKey(new Date());
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return today;
  if (raw > today) return today;
  return raw;
}

export function NutritionPageLoader() {
  const user = useAppUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate = parseNutritionDate(searchParams.get("date"));
  const [data, setData] = useState<NutritionPageData | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    api<NutritionPageData>(`app-pages/nutrition?date=${encodeURIComponent(selectedDate)}`)
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) router.refresh();
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, router]);

  if (!data) {
    return <AppPageSkeleton />;
  }

  return (
    <NutritionClient
      key={data.selectedDate}
      userId={user.id}
      meals={data.meals}
      scoreTrend={data.scoreTrend}
      limits={data.limits}
      selectedDate={data.selectedDate}
      isToday={data.isToday}
    />
  );
}
