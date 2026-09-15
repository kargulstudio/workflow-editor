"use client";

import type { CSSProperties } from "react";
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
      inert={!sidebarOpen}
      className="ease-smooth-in-out hidden w-0 shrink-0 overflow-hidden transition-[width] duration-300 data-open:w-[70px] motion-reduce:transition-none sm:block"
    >
      <nav
        aria-label="Primary"
        className="flex h-full w-[70px] flex-col items-center gap-8 px-4 py-5"
      >
        <LogoIcon aria-label="Buzzing" role="img" className="size-8 shrink-0" />

        <div className="flex min-h-0 flex-1 flex-col items-center gap-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="round"
                size="icon-lg"
                aria-label="Create automation"
                onClick={createAutomation}
              >
                <PlusIcon aria-hidden className="size-[15px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New automation</TooltipContent>
          </Tooltip>

          <ul
            style={{ "--nav-index": active } as CSSProperties}
            className="relative flex flex-col gap-2.5"
          >
            <span
              aria-hidden
              className="ease-smooth-in-out absolute top-2 left-[-17px] h-5 w-0.5 translate-y-[calc(var(--nav-index)*46px)] rounded-r-[4px] bg-white shadow-[2px_0_8px_1px_rgb(255_255_255/0.25)] transition-transform duration-300 motion-reduce:transition-none"
            />
            {items.map(({ label, Icon, screen: target }, index) => (
              <li key={label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="nav"
                      size="icon-lg"
                      aria-label={label}
                      aria-current={active === index ? "page" : undefined}
                      onClick={() => {
                        if (target) openScreen(target);
                        else
                          toast(`${label} is coming soon`, {
                            description:
                              "We’re polishing it for the next release.",
                          });
                      }}
                    >
                      <Icon aria-hidden className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Automation settings"
              onClick={() => openAutomation(automationId, "settings")}
            >
              <CogIcon
                aria-hidden
                className="ease-power3-in-out size-5 text-white/32 transition-colors duration-150 group-hover:text-white/60"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </div>
  );
}
