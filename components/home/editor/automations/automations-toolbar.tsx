"use client";

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

type AutomationsToolbarProps = {
  filters: Filters;
  view: "table" | "grid";
  onChange: (patch: Partial<Filters>) => void;
  onToggleView: () => void;
  onCreate: () => void;
};

export default function AutomationsToolbar({
  filters,
  view,
  onChange,
  onToggleView,
  onCreate,
}: AutomationsToolbarProps) {
  const category = CATEGORIES.find((item) => item.value === filters.category)!;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="field" size="field">
              <SortIcon aria-hidden className="size-[18px] text-white/60" />
              <span className="pr-1">
                <span className="text-white/60">Sorted by</span>{" "}
                <span className="font-semibold text-white">{filters.sort}</span>
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
              onCheckedChange={(checked) => onChange({ descending: !checked })}
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
        <label className="relative block w-[min(280px,60vw)]">
          <span className="sr-only">Search automations</span>
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1.5 left-1.5 size-5 text-white/40"
          />
          <input
            type="search"
            value={filters.query}
            placeholder="Search"
            onChange={(event) => onChange({ query: event.target.value })}
            className={cn(
              fieldSurface,
              "h-8 w-full bg-[#1b1b20]/50 pr-3 pl-[34px] text-white/90 shadow-[0_2px_4px_-1px_rgb(0_0_0/0.08),0_1px_1px_-1px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)] placeholder:text-white/80 [&::-webkit-search-cancel-button]:hidden",
            )}
          />
        </label>
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
  );
}
