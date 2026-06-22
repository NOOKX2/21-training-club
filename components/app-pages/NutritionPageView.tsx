"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { preload } from "swr";
import { NutritionClient } from "@/components/NutritionClient";
import { useNutritionPage } from "@/lib/hooks/use-app-page";
import { api } from "@/lib/api-client";
import { localDateKey, shiftDateKey } from "@/lib/date-utils";
import { replaceAppUrl } from "@/lib/sync-url";

const fetcher = <T,>(path: string) => api<T>(path);

function parseNutritionDate(raw: string | null): string {
  const today = localDateKey(new Date());
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return today;
  if (raw > today) return today;
  return raw;
}

function prefetchNutritionDates(anchor: string) {
  for (let offset = -7; offset <= 0; offset += 1) {
    void preload(`app-pages/nutrition?date=${shiftDateKey(anchor, offset)}`, fetcher);
  }
}

export function NutritionPageView() {
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(() =>
    parseNutritionDate(searchParams.get("date"))
  );
  const { data } = useNutritionPage(selectedDate);

  useEffect(() => {
    setSelectedDate(parseNutritionDate(searchParams.get("date")));
  }, [searchParams]);

  useEffect(() => {
    prefetchNutritionDates(selectedDate);
  }, [selectedDate]);

  const onDateChange = useCallback((date: string) => {
    const today = localDateKey(new Date());
    setSelectedDate(date);
    replaceAppUrl("/nutrition", date === today ? {} : { date });
    prefetchNutritionDates(date);
  }, []);

  if (!data || data.selectedDate !== selectedDate) return null;

  return (
    <NutritionClient
      userId={data.userId}
      meals={data.meals}
      scoreTrend={data.scoreTrend}
      limits={data.limits}
      selectedDate={selectedDate}
      isToday={data.isToday}
      onDateChange={onDateChange}
    />
  );
}
