"use client";

import { ProgressClient } from "@/components/ProgressClient";
import { useProgressPage } from "@/lib/hooks/use-app-page";

export function ProgressPageView() {
  const { data } = useProgressPage();
  if (!data) return null;

  return (
    <ProgressClient
      userId={data.userId}
      initialHistory={data.history}
      initialPhotos={data.photos}
      initialHeight={data.height}
    />
  );
}
