"use client";

import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import Button from "./button";

type SegmentedTabsProps<T extends string> = {
  label: string;
  items: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export default function SegmentedTabs<T extends string>({
  label,
  items,
  value,
  onChange,
  className,
}: SegmentedTabsProps<T>) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = items.findIndex((item) => item.value === value);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = items[(index + step + items.length) % items.length];
    onChange(next.value);
    const tablist = event.currentTarget;
    requestAnimationFrame(() =>
      tablist
        .querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
        ?.focus(),
    );
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex w-fit gap-0.5 rounded-[9px] bg-[#121215] p-px shadow-[0_0_0_1px_rgb(0_0_0/0.24),0_1px_1px_rgb(0_0_0/0.05),inset_0_2px_4px_rgb(0_0_0/0.2),inset_0_1.048px_2.096px_rgb(0_0_0/0.05)]",
        className,
      )}
    >
      {items.map((item) => (
        <Button
          key={item.value}
          variant="tab"
          size="tab"
          role="tab"
          data-value={item.value}
          aria-selected={value === item.value}
          tabIndex={value === item.value ? 0 : -1}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
