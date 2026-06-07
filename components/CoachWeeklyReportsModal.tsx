"use client";

import { X } from "lucide-react";
import type { WeeklyReport } from "@/lib/data";
import { clientCardInner } from "@/lib/client-ui";
import { cn } from "@/lib/utils";

export function CoachWeeklyReportsModal({
  open,
  onClose,
  reports,
}: {
  open: boolean;
  onClose: () => void;
  reports: WeeklyReport[];
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Reports from coach"
    >
      <div
        className={cn(
          clientCardInner,
          "max-h-[min(80vh,640px)] w-full max-w-lg overflow-hidden rounded-2xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">
              Report from Coach
            </p>
            <p className="mt-1 text-xs text-white/45">Weekly feedback from your coach</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(min(80vh,640px)-4.5rem)] overflow-y-auto p-5">
          {reports.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/45">
              No weekly reports yet. Your coach will post feedback here.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-xl border border-white/10 bg-black/35 p-4"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A8C5DC]">
                    Week {report.week_number}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
                    {report.report_text}
                  </p>
                  {report.updated_at && (
                    <p className="mt-3 text-[10px] text-white/35">
                      Updated{" "}
                      {new Date(report.updated_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
