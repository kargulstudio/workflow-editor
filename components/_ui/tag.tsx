import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TagTone = "violet" | "green" | "red" | "cyan" | "neutral" | "amber";

const tones: Record<TagTone, string> = {
  violet:
    "bg-[#551dff]/5 text-[#7f59f0] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32),0_4px_6px_rgb(127_89_240/0.4)]",
  green:
    "bg-[#59f089]/5 text-[#59f089] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32),0_4px_6px_rgb(66_188_105/0.4)]",
  red: "bg-[#f05959]/5 text-[#f05959] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32),0_4px_6px_rgb(240_89_89/0.4)]",
  cyan: "bg-[#59ebf0]/14 font-medium text-[#59ebf0] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32),0_4px_6px_rgb(99_89_240/0.4)]",
  amber:
    "bg-[#ffb575]/8 text-[#ffb575] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32),0_4px_6px_rgb(255_181_117/0.3)]",
  neutral: "bg-white/5 text-white/70",
};

type TagProps = {
  tone: TagTone;
  children: ReactNode;
  className?: string;
};

export default function Tag({ tone, children, className }: TagProps) {
  return (
    <span
      className={cn(
        "relative inline-flex h-6 shrink-0 items-center overflow-clip rounded-[8px] bg-[linear-gradient(178deg,rgb(255_255_255/0.02)_3.85%,rgb(255_255_255/0.014)_28%,rgb(255_255_255/0.008)_49%,rgb(255_255_255/0)_75%)] px-1.5 text-[12px] leading-6 font-[550] whitespace-nowrap shadow-[0_1px_2px_rgb(0_0_0/0.08),0_1px_0_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.16),inset_0_1px_0_rgb(255_255_255/0.01),inset_0_0_0_1px_rgb(253_253_255/0.04)]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
