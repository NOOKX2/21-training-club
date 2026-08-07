"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { preload } from "swr";
import { api } from "@/lib/api-client";
import { localDateKey, shiftDateKey } from "@/lib/date-utils";
import { CLIENT_WORKOUT_LOG_WEEK, progressPageKey, workoutWeekKey } from "@/lib/app-page-keys";
import { MAIN_TAB_ROUTES } from "@/lib/main-tabs";

const fetcher = <T,>(path: string) => api<T>(path);

export function PrefetchAppPages() {
  const router = useRouter();

  useEffect(() => {
    const today = localDateKey(new Date());

    for (const href of MAIN_TAB_ROUTES) {
      router.prefetch(href);
    }

    void preload(workoutWeekKey(CLIENT_WORKOUT_LOG_WEEK), fetcher);
    void preload(`app-pages/nutrition?date=${today}`, fetcher);
    for (let offset = -7; offset <= 0; offset += 1) {
      const date = shiftDateKey(today, offset);
      void preload(`app-pages/nutrition?date=${date}`, fetcher);
    }
    void preload(progressPageKey(), fetcher);
    void preload("app-pages/coach", fetcher);
    void preload("app-pages/profile", fetcher);
  }, [router]);

  return null;
}
