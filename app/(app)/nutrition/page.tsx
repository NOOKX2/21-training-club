import { Suspense } from "react";
import { NutritionPageView } from "@/components/app-pages/NutritionPageView";

export default function NutritionPage() {
  return (
    <Suspense fallback={null}>
      <NutritionPageView />
    </Suspense>
  );
}
