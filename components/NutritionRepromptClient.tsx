"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { NutritionHeader } from "@/components/NutritionHeader";
import { api } from "@/lib/api-client";
import type { MealSubmission } from "@/lib/data";
import { clientCard, clientField } from "@/lib/client-ui";
import { formatMealMacros, mealDisplayName } from "@/lib/nutrition-utils";
import { cn } from "@/lib/utils";

export function NutritionRepromptClient({
  meal,
  defaultPrompt,
  difyConfigured,
}: {
  meal: MealSubmission;
  defaultPrompt: string;
  difyConfigured: boolean;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) {
      setError(t("nutrition.promptRequired"));
      return;
    }
    setError("");
    setRunning(true);
    try {
      await api(`nutrition/meals-v2/${meal.id}/reprompt`, {
        method: "POST",
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      router.push("/nutrition");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("nutrition.repromptFailed"));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-0">
      <NutritionHeader showAddButton={false} />

      <form onSubmit={runAnalysis} className={cn(clientCard, "mx-auto mt-10 max-w-2xl p-8")}>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold uppercase tracking-wide text-white">
            {t("nutrition.repromptTitle")}
          </h2>
          <Link
            href="/nutrition"
            className="text-zinc-400 transition-colors hover:text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </Link>
        </div>

        <div className="mb-6 rounded-lg border border-white/10 bg-black/20 px-4 py-3">
          <p className="font-semibold text-white">{mealDisplayName(meal)}</p>
          {meal.description ? (
            <p className="mt-1 text-sm text-white/45">{meal.description}</p>
          ) : null}
          {formatMealMacros(meal) ? (
            <p className="mt-2 text-xs text-white/35">
              {t("nutrition.currentMacros")}: {formatMealMacros(meal)}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/45">
            {t("nutrition.promptLabel")}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className={cn(
              "w-full resize-y px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none",
              clientField
            )}
          />
          <p className="mt-2 text-xs text-white/35">{t("nutrition.repromptNote")}</p>
        </div>

        {!difyConfigured ? (
          <p className="mt-4 text-sm text-amber-400">{t("nutrition.difyNotConfigured")}</p>
        ) : null}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <Button
          type="submit"
          className="mt-8 h-14 w-full text-sm"
          disabled={running || !difyConfigured}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", running && "animate-spin")} />
          {running ? t("nutrition.repromptRunning") : t("nutrition.promptAgain")}
        </Button>
      </form>
    </div>
  );
}
