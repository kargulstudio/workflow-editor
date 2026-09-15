"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/_ui/shadcn/dropdown-menu";
import ChevronIcon from "@/public/assets/images/home/editor/workflow/chevron-right.svg";
import { fieldSurface } from "./field";

type SelectFieldProps = {
  id?: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  leading?: ReactNode;
  className?: string;
  align?: "start" | "end";
};

export default function SelectField({
  id,
  value,
  options,
  onChange,
  leading,
  className,
  align = "start",
}: SelectFieldProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={id}
        className={cn(
          fieldSurface,
          "group flex h-9 w-full cursor-pointer items-center gap-2 px-3 text-left data-[state=open]:bg-white/3 data-[state=open]:shadow-[0_0_0_1px_#17171c,0_0_0_4px_rgb(117_71_255/0.2),inset_0_0_0_1px_#7445ff]",
          className,
        )}
      >
        {leading}
        <span className="min-w-0 flex-1 truncate">{value}</span>
        <ChevronIcon
          aria-hidden
          className="ease-power3-in-out size-4 shrink-0 rotate-90 text-white/40 transition-transform duration-200 group-data-[state=open]:-rotate-90"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-(--radix-dropdown-menu-trigger-width) min-w-[180px]"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
