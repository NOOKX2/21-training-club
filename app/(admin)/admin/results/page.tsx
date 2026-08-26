import { Suspense } from "react";
import { AdminResultsPageView } from "@/app/(admin)/admin/results/_components/AdminResultsPageView";

export default function AdminResultsPage() {
  return (
    <Suspense fallback={null}>
      <AdminResultsPageView />
    </Suspense>
  );
}
