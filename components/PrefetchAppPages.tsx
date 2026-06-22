"use client";

import { useEffect } from "react";
import { preload } from "swr";
import { useAppUser } from "@/components/AppUserProvider";
import { api } from "@/lib/api-client";
import { localDateKey } from "@/lib/date-utils";
import {
  getProgramWeekDay,
  resolveProgramStartDate,
} from "@/lib/program-schedule";

const fetcher = <T,>(path: string) => api<T>(path);

export function PrefetchAppPages() {
  const user = useAppUser();

  useEffect(() => {
    const today = localDateKey(new Date());
    const { week, day } = getProgramWeekDay(resolveProgramStartDate(user));

    void preload(`app-pages/workouts?week=${week}&day=${day}`, fetcher);
    void preload(`app-pages/nutrition?date=${today}`, fetcher);
    void preload("app-pages/progress", fetcher);
    void preload("app-pages/coach", fetcher);
  }, [user]);

  return null;
}
