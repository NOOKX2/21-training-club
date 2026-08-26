import { Suspense } from "react";
import { AdminCustomProgramsPageView } from "@/app/(admin)/admin/custom-programs/_components/AdminCustomProgramsPageView";

export default function AdminCustomProgramsPage() {
  return (
    <Suspense fallback={null}>
      <AdminCustomProgramsPageView />
    </Suspense>
  );
}
