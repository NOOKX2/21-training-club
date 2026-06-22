"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NutritionReview } from "@/components/admin/NutritionReview";
import { localDateKey } from "@/lib/date-utils";
import { useAdminNutritionPage } from "@/lib/hooks/use-admin-page";

function parseDate(raw: string | null) {
  return raw ?? localDateKey(new Date());
}

export function AdminNutritionPageView() {
  const searchParams = useSearchParams();
  const [clientId, setClientId] = useState(() => searchParams.get("client") ?? "");
  const [date, setDate] = useState(() => parseDate(searchParams.get("date")));
  const { data } = useAdminNutritionPage(clientId, date);

  useEffect(() => {
    setClientId(searchParams.get("client") ?? "");
    setDate(parseDate(searchParams.get("date")));
  }, [searchParams]);

  if (!data || data.selectedClientId !== clientId || data.date !== date) {
    return null;
  }

  return (
    <NutritionReview
      clients={data.clients}
      selectedClientId={data.selectedClientId}
      date={data.date}
      meals={data.meals}
    />
  );
}
