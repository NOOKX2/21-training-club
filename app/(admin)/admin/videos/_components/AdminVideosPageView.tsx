"use client";

import { ExerciseVideoLibrary } from "@/app/(admin)/admin/videos/_components/ExerciseVideoLibrary";
import { useAdminVideosPage } from "@/lib/hooks/use-admin-page";

export function AdminVideosPageView() {
  const { data } = useAdminVideosPage();
  if (!data) return null;
  return <ExerciseVideoLibrary videos={data.videos} />;
}
