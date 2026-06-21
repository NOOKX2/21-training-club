import { clientCard, clientCardInner } from "@/lib/client-ui";
import { cn } from "@/lib/utils";

export function AppPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-6", className)} aria-hidden>
      <div className="flex items-center justify-between gap-3">
        <div className="h-3 w-28 rounded bg-white/10" />
        <div className="h-8 w-24 rounded-lg bg-white/10" />
      </div>
      <div className={cn(clientCard, "p-4 sm:p-5")}>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className={cn(clientCardInner, "h-24")} />
          <div className={cn(clientCardInner, "h-24")} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
          <div className={cn(clientCardInner, "h-20")} />
          <div className={cn(clientCardInner, "h-20")} />
          <div className={cn(clientCardInner, "h-20")} />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-32 rounded bg-white/10" />
        <div className={cn(clientCard, "h-28")} />
        <div className={cn(clientCard, "h-28")} />
      </div>
    </div>
  );
}
