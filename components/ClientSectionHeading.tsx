import { cn } from "@/lib/utils";
import { clientSectionLabel } from "@/lib/client-ui";

export function ClientSectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", clientSectionLabel, className)}>
      <span>{children}</span>
      <span className="h-px flex-1 bg-white/10" aria-hidden />
    </div>
  );
}
