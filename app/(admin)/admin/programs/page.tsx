import { Suspense } from "react";
import { AdminProgramsPageView } from "@/app/(admin)/admin/programs/_components/AdminProgramsPageView";

export default function AdminProgramsPage() {
  return (
    <Suspense fallback={null}>
      <AdminProgramsPageView />
    </Suspense>
  );
}
