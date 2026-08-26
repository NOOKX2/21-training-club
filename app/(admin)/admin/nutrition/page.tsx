import { Suspense } from "react";
import { AdminNutritionPageView } from "@/app/(admin)/admin/nutrition/_components/AdminNutritionPageView";

export default function AdminNutritionPage() {
  return (
    <Suspense fallback={null}>
      <AdminNutritionPageView />
    </Suspense>
  );
}
