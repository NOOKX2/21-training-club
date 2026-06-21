"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { clientPageEyebrow } from "@/lib/client-ui";

export function AppPageLoading() {
  const { t } = useLanguage();

  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-[#6B93B8]" />
      <p className={clientPageEyebrow}>{t("common.loadingPage")}</p>
    </div>
  );
}
