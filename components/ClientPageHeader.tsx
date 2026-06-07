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
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <p className={clientPageEyebrow}>{eyebrow}</p>
        <h1 className={cn(clientPageTitle, "mt-2")}>{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-white/45">{subtitle}</p> : null}
      </div>
      {actions ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
