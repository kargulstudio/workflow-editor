"use client";

import type { CSSProperties, ReactElement } from "react";
import { toast } from "sonner";
import Button from "@/components/_ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/_ui/shadcn/tooltip";
import { useAppStore, type Screen } from "@/stores/app-store";
import LogoIcon from "@/public/assets/images/home/editor/sidebar/logo.svg";
import PlusIcon from "@/public/assets/images/home/editor/sidebar/plus.svg";
import DashboardIcon from "@/public/assets/images/home/editor/sidebar/dashboard.svg";
import BoltIcon from "@/public/assets/images/home/editor/sidebar/bolt.svg";
import DraftsIcon from "@/public/assets/images/home/editor/sidebar/drafts.svg";
import BarChartIcon from "@/public/assets/images/home/editor/sidebar/bar-chart.svg";
import MenuBookIcon from "@/public/assets/images/home/editor/sidebar/menu-book.svg";
import CogIcon from "@/public/assets/images/home/editor/sidebar/cog.svg";

const items: { label: string; Icon: typeof DashboardIcon; screen?: Screen }[] =
  [
    { label: "Dashboard", Icon: DashboardIcon, screen: "dashboard" },
    { label: "Automations", Icon: BoltIcon, screen: "automations" },
    { label: "Campaigns", Icon: DraftsIcon },
    { label: "Analytics", Icon: BarChartIcon },
    { label: "Docs", Icon: MenuBookIcon },
  ];

const label =
  "ease-power3-out w-0 overflow-hidden text-left text-[14px] leading-5 font-medium whitespace-nowrap opacity-0 transition-opacity duration-150 group-data-open/rail:w-auto group-data-open/rail:opacity-100";

const row =
  "group-data-open/rail:w-full group-data-open/rail:justify-start group-data-open/rail:gap-3 group-data-open/rail:px-2.5";

function RailTooltip({
  title,
  expanded,
  children,
}: {
  title: string;
  expanded: boolean;
  children: ReactElement;
}) {
  if (expanded) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  );
}

export default function EditorSidebar() {
  const screen = useAppStore((state) => state.screen);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const openScreen = useAppStore((state) => state.openScreen);
  const openAutomation = useAppStore((state) => state.openAutomation);
  const createAutomation = useAppStore((state) => state.createAutomation);
  const automationId = useAppStore((state) => state.automationId);
  const active = screen === "dashboard" ? 0 : 1;

  return (
    <div
      data-open={sidebarOpen || undefined}
      className="ease-smooth-in-out group/rail hidden w-[70px] shrink-0 overflow-hidden transition-[width] duration-300 data-open:w-[236px] motion-reduce:transition-none sm:block"
    >
      <nav
        aria-label="Primary"
        className="flex h-full w-[236px] flex-col items-center gap-8 px-4 py-5 group-data-open/rail:items-stretch"
      >
        <span className="flex h-8 shrink-0 items-center gap-3">
          <LogoIcon
            aria-label="Buzzing"
            role="img"
            className="size-8 shrink-0"
          />
          <span
            className={`${label} text-[15px] font-[550] tracking-[-0.01em] text-white`}
          >
            Buzzing
          </span>
        </span>

        <div className="flex min-h-0 flex-1 flex-col items-center gap-5 group-data-open/rail:items-stretch">
          <RailTooltip title="New automation" expanded={sidebarOpen}>
            <Button
              variant="round"
              size="icon-lg"
              aria-label="Create automation"
              onClick={createAutomation}
              className={`${row} group-data-open/rail:rounded-[12px]`}
            >
              <PlusIcon aria-hidden className="size-[15px] shrink-0" />
              <span className={label}>New automation</span>
            </Button>
          </RailTooltip>

          <ul
            style={{ "--nav-index": active } as CSSProperties}
            className="relative flex flex-col gap-2.5"
          >
            <span
              aria-hidden
              className="ease-smooth-in-out absolute top-2 left-[-17px] h-5 w-0.5 translate-y-[calc(var(--nav-index)*46px)] rounded-r-[4px] bg-white shadow-[2px_0_8px_1px_rgb(255_255_255/0.25)] transition-transform duration-300 motion-reduce:transition-none"
            />
            {items.map(({ label: title, Icon, screen: target }, index) => (
              <li key={title} className="flex">
                <RailTooltip title={title} expanded={sidebarOpen}>
                  <Button
                    variant="nav"
                    size="icon-lg"
                    aria-label={title}
                    aria-current={active === index ? "page" : undefined}
                    className={row}
                    onClick={() => {
                      if (target) openScreen(target);
                      else
                        toast(`${title} is coming soon`, {
                          description:
                            "We’re polishing it for the next release.",
                        });
                    }}
                  >
                    <Icon aria-hidden className="size-5 shrink-0" />
                    <span className={label}>{title}</span>
                  </Button>
                </RailTooltip>
              </li>
            ))}
          </ul>
        </div>

        <RailTooltip title="Settings" expanded={sidebarOpen}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Automation settings"
            className={`${row} group-data-open/rail:h-9`}
            onClick={() => openAutomation(automationId, "settings")}
          >
            <CogIcon
              aria-hidden
              className="ease-power3-in-out size-5 shrink-0 text-white/32 transition-colors duration-150 group-hover:text-white/60"
            />
            <span className={`${label} text-white/50`}>Settings</span>
          </Button>
        </RailTooltip>
      </nav>
    </div>
  );
}
