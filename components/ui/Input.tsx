import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";
import { clientField } from "@/lib/client-ui";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none",
          clientField,
          className
        )}
        {...props}
      />
    );
  }
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
    {children}
  </span>
);
