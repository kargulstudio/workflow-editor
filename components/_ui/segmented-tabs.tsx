"use client";

import type { KeyboardEvent } from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import Button from "./button";

type SegmentedTabsProps<T extends string> = {
  label: string;
  items: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

const active =
  "bg-linear-to-b from-[#16161a] via-[#16161a] via-50% to-[#1e1e24] font-semibold text-white shadow-[inset_0_-1px_2px_rgb(0_0_0/0.32),inset_0_2px_4px_rgb(0_0_0/0.2),inset_0_-1px_2px_rgb(255_255_255/0.08),inset_0_-1px_0.5px_rgb(0_0_0/0.02),inset_0_0_1px_rgb(0_0_0/0.05)] text-shadow-[0_1px_8px_rgb(255_255_255/0.1)]";

export default function SegmentedTabs<T extends string>({
  label,
  items,
  value,
  onChange,
  className,
}: SegmentedTabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const wrap = items.length > 3;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = items.findIndex((item) => item.value === value);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = items[(index + step + items.length) % items.length];
    onChange(next.value);
    const list = listRef.current;
    requestAnimationFrame(() =>
      list
        ?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
        ?.focus(),
    );
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(
        "gap-0.5 overflow-hidden rounded-[9px] bg-[#121215] p-px shadow-[0_0_0_1px_rgb(0_0_0/0.24),0_1px_1px_rgb(0_0_0/0.05),inset_0_2px_4px_rgb(0_0_0/0.2),inset_0_1.048px_2.096px_rgb(0_0_0/0.05)]",
        wrap ? "grid w-full grid-cols-2 sm:flex sm:w-fit" : "flex w-fit",
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
          <span aria-hidden className="invisible font-semibold">
            {item.label}
          </span>
          <span className="absolute inset-0 grid place-items-center">
            {item.label}
          </span>
          <span
            aria-hidden
            data-active={value === item.value || undefined}
            className={cn(
              "ease-power3-in-out absolute inset-0 grid place-items-center rounded-[inherit] opacity-0 transition-opacity duration-200 data-active:opacity-100",
              active,
            )}
          >
            {item.label}
          </span>
        </Button>
      ))}
    </div>
  );
}
