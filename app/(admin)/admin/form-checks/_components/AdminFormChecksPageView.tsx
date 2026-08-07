"use client";

import { FormCheckQueue } from "@/app/(admin)/admin/form-checks/_components/FormCheckQueue";
import { useAdminFormChecksPage } from "@/lib/hooks/use-admin-page";

export function AdminFormChecksPageView() {
  const { data } = useAdminFormChecksPage();
  if (!data) return null;
  return <FormCheckQueue submissions={data.submissions} />;
}
