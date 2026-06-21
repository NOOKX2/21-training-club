import { Suspense } from "react";
import { WorkoutsPageLoader } from "@/components/page-loaders/WorkoutsPageLoader";
import { AppPageSkeleton } from "@/components/AppPageSkeleton";

export default function WorkoutsPage() {
  return (
    <Suspense fallback={<AppPageSkeleton />}>
      <WorkoutsPageLoader />
    </Suspense>
  );
}
