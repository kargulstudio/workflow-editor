"use client";

import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/_ui/button";
import IconBadge from "@/components/_ui/icon-badge";
import { useAppStore } from "@/stores/app-store";
import BoltIcon from "@/public/assets/images/home/editor/automations/bolt.svg";
import AutomationsToolbar from "./automations-toolbar";
import AutomationsTable from "./automations-table";
import AutomationsGrid from "./automations-grid";
import { applyFilters, useNow, type Filters } from "./automations-utils";

const INITIAL_FILTERS: Filters = {
  sort: "creation date",
  descending: true,
  category: "all",
  statuses: [],
  query: "",
};

export default function Automations() {
  const automations = useAppStore((state) => state.automations);
  const openAutomation = useAppStore((state) => state.openAutomation);
  const createAutomation = useAppStore((state) => state.createAutomation);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [view, setView] = useState<"table" | "grid">("table");
  const now = useNow();

  const visible = applyFilters(automations, filters);
  const update = (patch: Partial<Filters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-10 p-4 sm:p-8">
        <div className="flex flex-col gap-3">
          <IconBadge>
            <BoltIcon className="size-[22px] text-white" />
          </IconBadge>
          <div className="flex flex-col gap-1.5">
            <span
              role="heading"
              aria-level={1}
              className="text-[24px] leading-8 font-semibold text-white"
            >
              Automations
            </span>
            <span className="text-[14px] leading-6 font-normal text-white/80">
              Craft seamless automated journeys for your newsletter subscribers.
              Need help getting started?{" "}
              <Button
                variant="bare"
                size="bare"
                className="inline font-medium text-[#7f59f0] underline-offset-4 transition-colors duration-150 hover:text-[#9b7dff] hover:underline"
                onClick={() =>
                  toast("Tutorial: Your first automation", {
                    description:
                      "4 min video · Build a welcome series from scratch.",
                  })
                }
              >
                Watch the tutorial
              </Button>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <AutomationsToolbar
            filters={filters}
            view={view}
            onChange={update}
            onToggleView={() =>
              setView((current) => (current === "table" ? "grid" : "table"))
            }
            onCreate={createAutomation}
          />

          <div className="flex flex-col gap-5">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-[16px] bg-[#141417] px-6 py-16 text-center shadow-[0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.04)]">
                <span className="text-[16px] leading-6 font-[550] text-white">
                  No automations match
                </span>
                <span className="text-[14px] leading-5 font-normal text-white/50">
                  Try a different search or clear the filters.
                </span>
                <Button
                  variant="field"
                  size="field"
                  className="px-3"
                  onClick={() => setFilters(INITIAL_FILTERS)}
                >
                  Clear filters
                </Button>
              </div>
            ) : view === "table" ? (
              <AutomationsTable
                automations={visible}
                now={now}
                sortedByEdit={filters.sort === "last edited"}
                descending={filters.descending}
                onSortByEdit={() =>
                  update({
                    sort: "last edited",
                    descending:
                      filters.sort === "last edited"
                        ? !filters.descending
                        : true,
                  })
                }
                onOpen={(id) => openAutomation(id)}
              />
            ) : (
              <AutomationsGrid
                automations={visible}
                now={now}
                onOpen={(id) => openAutomation(id)}
              />
            )}
            <span className="text-[14px] leading-6 font-medium text-white">
              Showing <span className="tabular-nums">{visible.length}</span>{" "}
              <span className="text-white/50">
                of {automations.length}{" "}
                {automations.length === 1 ? "item" : "items"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
