import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconBadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function IconBadge({ children, className }: IconBadgeProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-black bg-linear-to-l from-[#1b1b20]/50 via-[#1b1b20]/50 via-50% to-[#27272e]/50 shadow-[0_4.444px_8.889px_rgb(0_0_0/0.08),0_2.222px_4.444px_rgb(0_0_0/0.12),0_1.111px_2.222px_rgb(0_0_0/0.16),inset_0_1.111px_0_rgb(255_255_255/0.1),inset_0_0_0_1.111px_rgb(253_253_255/0.04)] backdrop-blur-[3px]",
        className,
      )}
    >
      {children}
    </span>
  );
}
