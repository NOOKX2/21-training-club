import { Suspense } from "react";
import { AppPageLoading } from "@/components/AppPageLoading";
import { ProgressClient } from "@/components/ProgressClient";
import {
  getProgressPhotos,
  getUserHeight,
  getWeightHistory,
} from "@/lib/data";
import { requireAppUser } from "@/lib/session";

async function ProgressPageContent() {
  const user = await requireAppUser();
  const [history, photos, height] = await Promise.all([
    getWeightHistory(user.id),
    getProgressPhotos(user.id),
    getUserHeight(user.id),
  ]);
  return (
    <ProgressClient
      userId={user.id}
      initialHistory={history}
      initialPhotos={photos}
      initialHeight={height}
    />
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={<AppPageLoading />}>
      <ProgressPageContent />
    </Suspense>
  );
}
