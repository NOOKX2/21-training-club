import { Suspense } from "react";
import { WorkoutsPageView } from "@/components/app-pages/WorkoutsPageView";

export default function WorkoutsPage() {
  return (
    <Suspense fallback={null}>
      <WorkoutsPageView />
    </Suspense>
  );
}
