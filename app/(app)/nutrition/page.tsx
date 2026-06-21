import { Suspense } from "react";
import { NutritionPageLoader } from "@/components/page-loaders/NutritionPageLoader";
import { AppPageSkeleton } from "@/components/AppPageSkeleton";

export default function NutritionPage() {
  return (
    <Suspense fallback={<AppPageSkeleton />}>
      <NutritionPageLoader />
    </Suspense>
  );
}
