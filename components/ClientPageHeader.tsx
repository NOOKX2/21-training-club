import { cn } from "@/lib/utils";
import { clientPageEyebrow, clientPageTitle } from "@/lib/client-ui";

export function ClientPageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <p className={clientPageEyebrow}>{eyebrow}</p>
        <h1 className={cn(clientPageTitle, "mt-2")}>{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-white/45">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
