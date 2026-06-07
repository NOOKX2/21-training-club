import Link from "next/link";
import { cn } from "@/lib/utils";

export function ClientBrandLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/workouts"
      prefetch={false}
      aria-label="21 Training Club — go to workouts"
      className={cn("flex items-center gap-2.5 no-underline", className)}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-[9px] bg-[#6B93B8] font-extrabold leading-none tracking-[-0.04em] text-white",
          compact ? "h-9 w-9 text-[15px]" : "h-10 w-10 text-lg"
        )}
      >
        21
      </div>
      <div className={cn("leading-tight text-white", compact && "hidden sm:block")}>
        <strong className={cn("block font-bold tracking-wide", compact ? "text-sm" : "text-sm")}>
          Training Club
        </strong>
        {!compact && (
          <small className="text-[9px] font-normal uppercase tracking-[0.22em] text-white/55">
            Elite Performance
          </small>
        )}
      </div>
    </Link>
  );
}
