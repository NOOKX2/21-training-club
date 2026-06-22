"use client";

import { useEffect } from "react";
import { preload } from "swr";
import { api } from "@/lib/api-client";
import {
  adminChatKey,
  adminClientsKey,
  adminCustomProgramsKey,
  adminDashboardKey,
  adminFormChecksKey,
  adminNutritionKey,
  adminProgramsKey,
  adminResultsKey,
  adminVideosKey,
  adminWeightVerificationKey,
} from "@/lib/admin-page-keys";
import { localDateKey } from "@/lib/date-utils";

const fetcher = <T,>(path: string) => api<T>(path);

export function PrefetchAdminPages() {
  useEffect(() => {
    void preload(adminDashboardKey(), fetcher);
    void preload(adminClientsKey(), fetcher);
    void preload(adminChatKey(), fetcher);
    void preload(adminProgramsKey("Fat Loss", 1), fetcher);
    void preload(adminCustomProgramsKey("", 1, 1), fetcher);
    void preload(adminResultsKey("", 1, 1), fetcher);
    void preload(adminWeightVerificationKey(), fetcher);
    void preload(adminVideosKey(), fetcher);
    void preload(adminNutritionKey("", localDateKey(new Date())), fetcher);
    void preload(adminFormChecksKey(), fetcher);
  }, []);

  return null;
}
