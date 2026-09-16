"use client";

import Button from "@/components/_ui/button";
import Divider from "@/components/_ui/divider";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/_ui/shadcn/dialog";
import { Switch } from "@/components/_ui/shadcn/switch";
import { STATUS_LABEL } from "@/stores/app-store";
import CloseIcon from "@/public/assets/images/home/editor/workflow/zoom-in.svg";
import { CATEGORIES, SORTS, STATUSES, type Filters } from "./automations-utils";

type AutomationsFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Filters;
  resultCount: number;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
};

const chip =
  "h-9 px-3 aria-pressed:bg-[#7f59f0]/14 aria-pressed:text-white aria-pressed:shadow-[0_0_0_1px_rgb(0_0_0/0.12),inset_0_0_0_1px_rgb(127_89_240/0.55)]";

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div role="group" aria-label={title} className="flex flex-col gap-2.5">
      <span className="text-[12px] leading-4 font-[550] text-white/50 uppercase">
        {title}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function AutomationsFilterSheet({
  open,
  onOpenChange,
  filters,
  resultCount,
  onChange,
  onReset,
}: AutomationsFilterSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="sheet" aria-describedby={undefined}>
        <span
          aria-hidden
          className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-white/15"
        />
        <div className="flex shrink-0 items-center justify-between gap-3 px-[18px] pt-2 pb-3">
          <DialogTitle>Filters</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close filters">
              <CloseIcon
                aria-hidden
                className="ease-power3-in-out size-[18px] rotate-45 text-white/70 transition-colors duration-150 group-hover:text-white"
              />
            </Button>
          </DialogClose>
        </div>
        <Divider />

        <div className="flex min-h-0 flex-col gap-6 overflow-y-auto px-[18px] py-5">
          <Group title="Sort by">
            {SORTS.map((sort) => (
              <Button
                key={sort}
                variant="field"
                size="field"
                aria-pressed={filters.sort === sort}
                className={chip}
                onClick={() => onChange({ sort })}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </Button>
            ))}
          </Group>

          <label
            htmlFor="filters-reverse"
            className="flex cursor-pointer items-center justify-between gap-6 rounded-[12px] bg-white/2 px-4 py-3 shadow-[0_0_0_1px_rgb(0_0_0/0.12),inset_0_0_0_1px_rgb(255_255_255/0.04)]"
          >
            <span className="flex flex-col">
              <span className="text-[14px] leading-5 font-[550] text-white">
                Oldest first
              </span>
              <span className="text-[13px] leading-5 text-white/50">
                Flip the order of the list.
              </span>
            </span>
            <Switch
              id="filters-reverse"
              checked={!filters.descending}
              onCheckedChange={(checked) => onChange({ descending: !checked })}
            />
          </label>

          <Group title="Category">
            {CATEGORIES.map((item) => (
              <Button
                key={item.value}
                variant="field"
                size="field"
                aria-pressed={filters.category === item.value}
                className={chip}
                onClick={() => onChange({ category: item.value })}
              >
                {item.label}
              </Button>
            ))}
          </Group>

          <Group title="Status">
            {STATUSES.map((status) => {
              const active = filters.statuses.includes(status);
              return (
                <Button
                  key={status}
                  variant="field"
                  size="field"
                  aria-pressed={active}
                  className={chip}
                  onClick={() =>
                    onChange({
                      statuses: active
                        ? filters.statuses.filter((item) => item !== status)
                        : [...filters.statuses, status],
                    })
                  }
                >
                  {STATUS_LABEL[status]}
                </Button>
              );
            })}
          </Group>
        </div>

        <Divider />
        <div className="flex shrink-0 items-center gap-3 px-[18px] pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <Button
            variant="field"
            size="field"
            className="h-10 px-4"
            onClick={onReset}
          >
            Reset
          </Button>
          <DialogClose asChild>
            <Button variant="accent" size="field" className="h-10 flex-1">
              Show {resultCount}{" "}
              {resultCount === 1 ? "automation" : "automations"}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
