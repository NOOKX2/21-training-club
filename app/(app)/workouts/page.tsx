import { Suspense } from "react";
import { WorkoutsPageView } from "@/app/(app)/workouts/_components/WorkoutsPageView";

export default function WorkoutsPage() {
  return (
    <Suspense fallback={null}>
      <WorkoutsPageView />
    </Suspense>
  );
}
