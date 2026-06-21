import { Suspense } from "react";
import { CoachPageLoader } from "@/components/page-loaders/CoachPageLoader";
import { AppPageSkeleton } from "@/components/AppPageSkeleton";

export default function CoachPage() {
  return (
    <Suspense fallback={<AppPageSkeleton />}>
      <CoachPageLoader />
    </Suspense>
  );
}
