"use client";

import { AppPageLoading } from "@/components/AppPageLoading";
import { ProgressClient } from "@/components/ProgressClient";
import {
  resolveProgressPageData,
  useProgressPage,
} from "@/lib/hooks/use-app-page";
import { useSWRConfig } from "swr";

export function ProgressPageView() {
  const { cache } = useSWRConfig();
  const { data } = useProgressPage();
  const resolved = resolveProgressPageData(data, cache);

  if (!resolved) return <AppPageLoading />;

  return (
    <ProgressClient
      userId={resolved.userId}
      initialHistory={resolved.history}
      initialPhotos={resolved.photos}
      initialHeight={resolved.height}
    />
  );
}
