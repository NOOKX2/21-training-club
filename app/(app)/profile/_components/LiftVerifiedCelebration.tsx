"use client";

import { useEffect } from "react";
import { Trophy } from "lucide-react";
import { formatLiftAmount } from "@/lib/lift-utils";

export function LiftVerifiedCelebration({
  exercise,
  weight,
  verifiedDate,
  onClose,
}: {
  exercise: string;
  weight: number;
  verifiedDate: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-x-0 top-20 z-[100] flex justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#6B93B8]/40 bg-zinc-950 px-5 py-5 text-center shadow-[0_0_40px_rgba(107,147,184,0.2)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#6B93B8] bg-[#6B93B8]/15">
          <Trophy className="h-7 w-7 text-[#6B93B8]" />
        </div>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B93B8]">
          Coach Verified
        </p>
        <p className="mt-2 text-lg font-bold uppercase text-white">{exercise}</p>
        <p className="mt-1 text-3xl font-black tabular-nums text-[#6B93B8]">
          {formatLiftAmount(exercise, weight)}
        </p>
        {verifiedDate ? (
          <p className="mt-2 text-xs text-zinc-400">Verified {verifiedDate}</p>
        ) : null}
        <p className="mt-3 text-sm text-zinc-300">Your PR is now official on your profile</p>
      </div>
    </div>
  );
}
