"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { preload } from "swr";
import { useAppUser } from "@/components/AppUserProvider";
import { api } from "@/lib/api-client";
import { localDateKey, shiftDateKey } from "@/lib/date-utils";
import { MAIN_TAB_ROUTES } from "@/lib/main-tabs";
import {
  getProgramWeekDay,
  resolveProgramStartDate,
} from "@/lib/program-schedule";

const fetcher = <T,>(path: string) => api<T>(path);

export function PrefetchAppPages() {
  const user = useAppUser();
  const router = useRouter();

  useEffect(() => {
    const today = localDateKey(new Date());
    const { week, day } = getProgramWeekDay(resolveProgramStartDate(user));

    for (const href of MAIN_TAB_ROUTES) {
      router.prefetch(href);
    }
    router.prefetch("/profile");

    for (let w = 1; w <= 4; w += 1) {
      void preload(`app-pages/workouts?week=${w}`, fetcher);
    }
    void preload(`app-pages/nutrition?date=${today}`, fetcher);
    for (let offset = -7; offset <= 0; offset += 1) {
      const date = shiftDateKey(today, offset);
      void preload(`app-pages/nutrition?date=${date}`, fetcher);
    }
    void preload("app-pages/progress", fetcher);
    void preload("app-pages/coach", fetcher);
  }, [router, user]);

  return null;
}
