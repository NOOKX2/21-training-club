"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NutritionClient } from "@/components/NutritionClient";
import { useNutritionPage } from "@/lib/hooks/use-app-page";
import { localDateKey } from "@/lib/date-utils";
import { replaceAppUrl } from "@/lib/sync-url";

function parseNutritionDate(raw: string | null): string {
  const today = localDateKey(new Date());
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return today;
  if (raw > today) return today;
  return raw;
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

  const onDateChange = useCallback((date: string) => {
    const today = localDateKey(new Date());
    setSelectedDate(date);
    replaceAppUrl("/nutrition", date === today ? {} : { date });
  }, []);

  if (!data || data.selectedDate !== selectedDate) return null;

  return (
    <NutritionClient
      key={data.selectedDate}
      userId={data.userId}
      meals={data.meals}
      scoreTrend={data.scoreTrend}
      limits={data.limits}
      selectedDate={data.selectedDate}
      isToday={data.isToday}
      onDateChange={onDateChange}
    />
  );
}
