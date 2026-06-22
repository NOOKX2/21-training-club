"use client";

import { FormCheckQueue } from "@/components/admin/FormCheckQueue";
import { useAdminFormChecksPage } from "@/lib/hooks/use-admin-page";

export function AdminFormChecksPageView() {
  const { data } = useAdminFormChecksPage();
  if (!data) return null;
  return <FormCheckQueue submissions={data.submissions} />;
}
