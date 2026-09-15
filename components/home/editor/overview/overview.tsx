"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import SegmentedTabs from "@/components/_ui/segmented-tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/_ui/shadcn/dropdown-menu";
import { useAppStore } from "@/stores/app-store";
import CalendarIcon from "@/public/assets/images/home/editor/overview/calendar.svg";
import OverviewStatCard from "./overview-stat-card";
import OverviewGrowthChart from "./overview-growth-chart";
import OverviewTopPosts from "./overview-top-posts";
import {
  OVERVIEW_TABS,
  RANGES,
  overviewData,
  type OverviewTab,
  type Range,
} from "./overview-data";

type OverviewProps = {
  variant: "dashboard" | "automation";
  textureSrc: string;
};

export default function Overview({ variant, textureSrc }: OverviewProps) {
  const [tab, setTab] = useState<OverviewTab>("overview");
  const [range, setRange] = useState<Range>("Last 4 Weeks");
  const automation = useAppStore((state) =>
    state.automations.find((item) => item.id === state.automationId),
  );

  const useDesign = variant === "dashboard" || automation?.id === "buzzing";
  const seed = useDesign ? "design" : (automation?.id ?? "design");
  const reach = useDesign ? 0 : (automation?.enrolled ?? 0);
  const { stats, chart } = overviewData(tab, range, seed, reach);

  const title =
    variant === "dashboard" ? "Hey hey 👋" : (automation?.name ?? "Overview");
  const description =
    variant === "dashboard"
      ? "Here's a quick snapshot of how your publication is performing."
      : "Here's a quick snapshot of how this automation is performing.";

  return (
    <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
      <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-10 px-4 pt-8 pb-10 sm:px-8 xl:px-20">
        <div className="flex flex-col gap-[18px]">
          <div className="flex flex-col gap-1.5">
            <span
              role="heading"
              aria-level={1}
              className="text-[24px] leading-8 font-semibold text-white"
            >
              {title}
            </span>
            <span className="text-[14px] leading-6 font-normal text-white/60">
              {description}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SegmentedTabs
              label="Overview sections"
              items={OVERVIEW_TABS}
              value={tab}
              onChange={setTab}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="field" size="field">
                  <CalendarIcon
                    aria-hidden
                    className="size-[18px] text-white/60"
                  />
                  <span className="pr-1">{range}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuRadioGroup
                  value={range}
                  onValueChange={(value) => setRange(value as Range)}
                >
                  {RANGES.map((option) => (
                    <DropdownMenuRadioItem key={option} value={option}>
                      {option}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <OverviewStatCard
                key={`${tab}-${stat.label}`}
                stat={stat}
                textureSrc={textureSrc}
              />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <OverviewGrowthChart
              data={chart}
              animationKey={`${seed}-${tab}-${range}`}
            />
            <OverviewTopPosts seed={seed} />
          </div>
        </div>
      </div>
    </div>
  );
}
