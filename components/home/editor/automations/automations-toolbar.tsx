"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import { fieldSurface } from "@/components/_ui/field";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/_ui/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/stores/app-store";
import SortIcon from "@/public/assets/images/home/editor/automations/sort.svg";
import FilterIcon from "@/public/assets/images/home/editor/automations/filter.svg";
import CircleDotIcon from "@/public/assets/images/home/editor/automations/circle-dot.svg";
import LayoutBoardIcon from "@/public/assets/images/home/editor/automations/layout-board.svg";
import SearchIcon from "@/public/assets/images/home/editor/topbar/search.svg";
import PlusIcon from "@/public/assets/images/home/editor/sidebar/plus.svg";
import {
  CATEGORIES,
  SORTS,
  STATUSES,
  type Filters,
  type Sort,
} from "./automations-utils";
import AutomationsFilterSheet from "./automations-filter-sheet";

type AutomationsToolbarProps = {
  filters: Filters;
  view: "table" | "grid";
  onChange: (patch: Partial<Filters>) => void;
  onToggleView: () => void;
  onCreate: () => void;
  onReset: () => void;
  resultCount: number;
};

export default function AutomationsToolbar({
  filters,
  view,
  onChange,
  onToggleView,
  onCreate,
  onReset,
  resultCount,
}: AutomationsToolbarProps) {
  const category = CATEGORIES.find((item) => item.value === filters.category)!;
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeFilters =
    Number(filters.sort !== "creation date" || !filters.descending) +
    Number(filters.category !== "all") +
    filters.statuses.length;

  return (
    <>
      <div className="flex flex-col gap-2.5 sm:hidden">
        <SearchField
          large
          value={filters.query}
          onChange={(query) => onChange({ query })}
          className="w-full"
        />
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            variant="field"
            size="field"
            className="h-10 gap-2 px-3"
            onClick={() => setSheetOpen(true)}
          >
            <FilterIcon aria-hidden className="size-[18px] text-white/60" />
            <span>Filters</span>
            {activeFilters > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7f59f0] px-1.5 text-[12px] leading-4 font-semibold text-white tabular-nums">
                {activeFilters}
              </span>
            )}
          </Button>
          <Button
            variant="accent"
            size="field"
            className="h-10 gap-2 px-3"
            onClick={onCreate}
          >
            <PlusIcon aria-hidden className="size-3.5" />
            <span>Create New</span>
          </Button>
        </div>
        <AutomationsFilterSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          filters={filters}
          resultCount={resultCount}
          onChange={onChange}
          onReset={onReset}
        />
      </div>
      <div className="hidden flex-wrap items-center justify-between gap-3 sm:flex">
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="field" size="field">
                <SortIcon aria-hidden className="size-[18px] text-white/60" />
                <span className="pr-1">
                  <span className="text-white/60">Sorted by</span>{" "}
                  <span className="font-semibold text-white">
                    {filters.sort}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Sort automations by</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filters.sort}
                onValueChange={(sort) =>
                  onChange({ sort: sort as Sort, descending: true })
                }
              >
                {SORTS.map((sort) => (
                  <DropdownMenuRadioItem
                    key={sort}
                    value={sort}
                    className="capitalize"
                  >
                    {sort}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={!filters.descending}
                onCheckedChange={(checked) =>
                  onChange({ descending: !checked })
                }
              >
                Reverse order
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="field" size="field">
                <FilterIcon aria-hidden className="size-[18px] text-white/60" />
                <span className="pr-1">{category.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuRadioGroup
                value={filters.category}
                onValueChange={(value) =>
                  onChange({ category: value as Filters["category"] })
                }
              >
                {CATEGORIES.map((item) => (
                  <DropdownMenuRadioItem key={item.value} value={item.value}>
                    {item.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="field" size="field">
                <CircleDotIcon
                  aria-hidden
                  className="size-[18px] text-white/60"
                />
                <span className="pr-1">
                  Status
                  {filters.statuses.length > 0 && (
                    <span className="text-white/50 tabular-nums">
                      {" "}
                      · {filters.statuses.length}
                    </span>
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {STATUSES.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filters.statuses.includes(status)}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) =>
                    onChange({
                      statuses: checked
                        ? [...filters.statuses, status]
                        : filters.statuses.filter((item) => item !== status),
                    })
                  }
                >
                  {STATUS_LABEL[status]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <SearchField
            value={filters.query}
            onChange={(query) => onChange({ query })}
            className="w-[min(280px,60vw)]"
          />
          <Button
            variant="brick"
            size="icon-lg"
            aria-label={view === "table" ? "Show as cards" : "Show as table"}
            aria-pressed={view === "grid"}
            onClick={onToggleView}
            className="aria-pressed:bg-[#26262d]"
          >
            <LayoutBoardIcon
              aria-hidden
              className="ease-smooth-in-out size-5 rotate-180 transition-transform duration-300 group-aria-pressed:rotate-90"
            />
          </Button>
          <Button
            variant="accent"
            size="field"
            className="pl-2"
            onClick={onCreate}
          >
            <span className="flex size-[18px] items-center justify-center">
              <PlusIcon aria-hidden className="size-3.5" />
            </span>
            <span className="pr-1">Create New</span>
          </Button>
        </div>
      </div>
    </>
  );
}

function SearchField({
  value,
  onChange,
  className,
  large,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  large?: boolean;
}) {
  return (
    <label className={cn("relative block min-w-0", className)}>
      <span className="sr-only">Search automations</span>
      <SearchIcon
        aria-hidden
        className={cn(
          "pointer-events-none absolute size-5 text-white/40",
          large ? "top-2.5 left-3" : "top-1.5 left-1.5",
        )}
      />
      <input
        type="search"
        value={value}
        placeholder={large ? "Search automations" : "Search"}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          fieldSurface,
          "w-full bg-[#1b1b20]/50 pr-3 text-white/90 shadow-[0_2px_4px_-1px_rgb(0_0_0/0.08),0_1px_1px_-1px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)] placeholder:text-white/80 [&::-webkit-search-cancel-button]:hidden",
          large
            ? "h-10 rounded-[10px] pl-10 placeholder:text-white/45"
            : "h-8 pl-[34px]",
        )}
      />
    </label>
  );
}
