import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const fieldSurface =
  "rounded-[8px] bg-white/2 text-[14px] leading-6 font-medium text-white shadow-[0_2px_4px_-1px_rgb(0_0_0/0.08),0_1px_1px_-1px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.12),inset_0_0_0_1px_rgb(255_255_255/0.04)] outline-none transition-[box-shadow,background-color] duration-150 ease-power3-in-out placeholder:text-white/40 hover:bg-white/3 focus-visible:bg-white/3 focus-visible:shadow-[0_0_0_1px_#17171c,0_0_0_4px_rgb(117_71_255/0.2),inset_0_0_0_1px_#7445ff] disabled:cursor-not-allowed disabled:opacity-50";

type FieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Field({
  label,
  htmlFor,
  hint,
  action,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <div className="flex h-6 items-center justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[12px] leading-6 font-[550] text-white/50"
        >
          {label}
        </label>
        {action}
      </div>
      {children}
      {hint && (
        <span className="text-[12px] leading-4 text-white/40">{hint}</span>
      )}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(fieldSurface, "h-9 w-full px-3 tabular-nums", className)}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        fieldSurface,
        "min-h-[120px] w-full resize-none rounded-[10px] px-3 py-1.5",
        className,
      )}
      {...props}
    />
  );
}
