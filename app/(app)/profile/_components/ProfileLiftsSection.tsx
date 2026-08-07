"use client";

import { Award, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/components/LanguageProvider";
import {
  LIFT_EXERCISES,
  liftStatusLabel,
  recordFor,
} from "@/app/(app)/profile/_components/profile-lift-utils";
import { clientCard, clientSectionLabel } from "@/lib/client-ui";
import type { LiftRecord } from "@/lib/data";
import { formatLocaleDate } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/types";
import { formatLiftAmount, liftInputPlaceholder } from "@/lib/lift-utils";
import { cn } from "@/lib/utils";

export function ProfileLiftsSection({
  records,
  lifts,
  readOnly,
  locale,
  onLiftChange,
  onSubmitLift,
}: {
  records: LiftRecord[];
  lifts: Record<string, string>;
  readOnly: boolean;
  locale: Locale;
  onLiftChange: (exercise: string, value: string) => void;
  onSubmitLift: (exercise: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <section className={cn(clientCard, "p-6")}>
      <h2
        className={cn(
          clientSectionLabel,
          "flex items-center gap-2 normal-case tracking-[0.18em] text-white/55"
        )}
      >
        <Award className="h-4 w-4 text-[#6B93B8]" />
        {t("profile.myTopLifts")}
      </h2>
      <div className="mt-6 space-y-6">
        {LIFT_EXERCISES.map((exercise) => {
          const record = recordFor(records, exercise);
          const status = record?.verification_status;
          const pending = status === "Pending";
          const verified = status === "Verified";
          const rejected = status === "Rejected";
          const submittedDate = formatLocaleDate(record?.submitted_at, locale);
          const verifiedDate = formatLocaleDate(
            record?.verified_at ?? record?.submitted_at,
            locale
          );
          const statusLabel = liftStatusLabel(status);

          return (
            <div key={exercise}>
              <p className="mb-2 text-sm font-bold uppercase text-white/80">{exercise}</p>

              {verified && record ? (
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#6B93B8]/35 bg-[#6B93B8]/10 px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6B93B8] text-white">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase text-[#6B93B8]">Coach Verified PR</p>
                    <p className="text-lg font-black tabular-nums text-white">
                      {formatLiftAmount(exercise, record.weight_lifted)}
                    </p>
                    {verifiedDate ? (
                      <p className="text-xs text-white/45">Verified {verifiedDate}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {!readOnly ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={liftInputPlaceholder(exercise, verified)}
                    value={lifts[exercise] ?? ""}
                    onChange={(e) => onLiftChange(exercise, e.target.value)}
                    disabled={pending}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant={exercise === "Long Run" ? "primary" : "dark"}
                    className="h-[46px] shrink-0 px-6 text-xs"
                    onClick={() => onSubmitLift(exercise)}
                    disabled={pending || !lifts[exercise]}
                  >
                    Submit
                  </Button>
                </div>
              ) : !record ? (
                <p className="text-sm text-white/35">No record yet</p>
              ) : null}

              {record ? (
                <p className="mt-2 text-xs text-white/45">
                  {submittedDate ? (
                    <>
                      Last submitted {submittedDate} ·{" "}
                      {formatLiftAmount(exercise, record.weight_lifted)}
                    </>
                  ) : (
                    <>Submitted · {formatLiftAmount(exercise, record.weight_lifted)}</>
                  )}
                  {statusLabel ? (
                    <span
                      className={
                        verified
                          ? "text-[#6B93B8]"
                          : rejected
                            ? "text-red-400"
                            : "text-zinc-500"
                      }
                    >
                      {" "}
                      · {statusLabel}
                    </span>
                  ) : null}
                </p>
              ) : null}

              {pending ? (
                <p className="mt-1 text-xs text-zinc-500">
                  Waiting for coach approval on Weight Verification
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
