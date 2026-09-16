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
  "ease-power3-out shrink-0 text-left text-[14px] leading-5 font-medium whitespace-nowrap opacity-0 transition-opacity duration-200 group-data-open/rail:opacity-100";

const row = "w-full justify-start gap-3 px-0";

const cell = "grid size-9 shrink-0 place-items-center";

function RailTooltip({
  title,
  expanded,
  children,
}: {
  title: string;
  expanded: boolean;
  children: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {!expanded && <TooltipContent side="right">{title}</TooltipContent>}
    </Tooltip>
  );
}

function Rail({
  expanded,
  onNavigate,
}: {
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const screen = useAppStore((state) => state.screen);
  const openScreen = useAppStore((state) => state.openScreen);
  const openAutomation = useAppStore((state) => state.openAutomation);
  const createAutomation = useAppStore((state) => state.createAutomation);
  const automationId = useAppStore((state) => state.automationId);
  const active = screen === "dashboard" ? 0 : 1;

  return (
    <nav
      aria-label="Primary"
      className="flex h-full w-full flex-col items-stretch gap-8 px-[17px] py-5"
    >
      <span className="flex items-center gap-3">
        <span className={cell}>
          <LogoIcon aria-label="Buzzing" role="img" className="size-8" />
        </span>
        <span
          className={`${label} text-[15px] font-[550] tracking-[-0.01em] text-white`}
        >
          Buzzing
        </span>
      </span>

      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <RailTooltip title="New automation" expanded={expanded}>
          <Button
            variant="round"
            size="icon-lg"
            aria-label="Create automation"
            onClick={() => {
              createAutomation();
              onNavigate?.();
            }}
            className={`${row} ease-smooth-in-out transition-[border-radius] duration-300 group-data-open/rail:rounded-[12px]`}
          >
            <span className={cell}>
              <PlusIcon aria-hidden className="size-[15px]" />
            </span>
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
              <RailTooltip title={title} expanded={expanded}>
                <Button
                  variant="nav"
                  size="icon-lg"
                  aria-label={title}
                  aria-current={active === index ? "page" : undefined}
                  className={row}
                  onClick={() => {
                    if (target) {
                      openScreen(target);
                      onNavigate?.();
                      return;
                    }
                    toast("Not available", {
                      className: "justify-center text-center",
                    });
                  }}
                >
                  <span className={cell}>
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span className={label}>{title}</span>
                </Button>
              </RailTooltip>
            </li>
          ))}
        </ul>
      </div>

      <RailTooltip title="Settings" expanded={expanded}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Automation settings"
          className={`${row} h-9`}
          onClick={() => {
            openAutomation(automationId, "settings");
            onNavigate?.();
          }}
        >
          <span className={cell}>
            <CogIcon
              aria-hidden
              className="ease-power3-in-out size-5 text-white/32 transition-colors duration-150 group-hover:text-white/60"
            />
          </span>
          <span className={`${label} text-white/50`}>Settings</span>
        </Button>
      </RailTooltip>
    </nav>
  );
}

export default function EditorSidebar() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <>
      <div
        data-open={sidebarOpen || undefined}
        className="ease-smooth-in-out group/rail hidden w-[70px] shrink-0 overflow-hidden transition-[width] duration-300 data-open:w-[236px] motion-reduce:transition-none sm:block"
      >
        <Rail expanded={sidebarOpen} />
      </div>

      {sidebarOpen && (
        <div className="sm:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={toggleSidebar}
            className="ease-power3-out animate-in fade-in fixed inset-0 z-40 bg-black/55 backdrop-blur-[3px] duration-200"
          />
          <div
            data-open
            className="ease-power3-out animate-in slide-in-from-left group/rail fixed inset-y-0 left-0 z-50 w-[236px] bg-[#0c0c0f] shadow-[8px_0_32px_rgb(0_0_0/0.5)] duration-300"
          >
            <Rail expanded onNavigate={toggleSidebar} />
          </div>
        </div>
      )}
    </>
  );
}
