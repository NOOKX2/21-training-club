"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressClient } from "@/components/ProgressClient";
import { AppPageSkeleton } from "@/components/AppPageSkeleton";
import { useAppUser } from "@/components/AppUserProvider";
import { api } from "@/lib/api-client";
import type { ProgressPhoto, WeightEntry } from "@/lib/data";

type ProgressPageData = {
  history: WeightEntry[];
  photos: ProgressPhoto[];
  height: number | null;
};

export function ProgressPageLoader() {
  const user = useAppUser();
  const router = useRouter();
  const [data, setData] = useState<ProgressPageData | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<ProgressPageData>("app-pages/progress")
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) router.refresh();
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!data) {
    return <AppPageSkeleton />;
  }

  return (
    <ProgressClient
      userId={user.id}
      initialHistory={data.history}
      initialPhotos={data.photos}
      initialHeight={data.height}
    />
  );
}
