import { Suspense } from "react";
import { NutritionPageView } from "@/app/(app)/nutrition/_components/NutritionPageView";

export default function NutritionPage() {
  return (
    <Suspense fallback={null}>
      <NutritionPageView />
    </Suspense>
  );
}
