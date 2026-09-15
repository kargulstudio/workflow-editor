"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Button from "@/components/_ui/button";
import LogoIcon from "@/public/assets/images/home/editor/sidebar/logo.svg";
import PlusIcon from "@/public/assets/images/home/editor/sidebar/plus.svg";
import DashboardIcon from "@/public/assets/images/home/editor/sidebar/dashboard.svg";
import BoltIcon from "@/public/assets/images/home/editor/sidebar/bolt.svg";
import DraftsIcon from "@/public/assets/images/home/editor/sidebar/drafts.svg";
import BarChartIcon from "@/public/assets/images/home/editor/sidebar/bar-chart.svg";
import MenuBookIcon from "@/public/assets/images/home/editor/sidebar/menu-book.svg";
import CogIcon from "@/public/assets/images/home/editor/sidebar/cog.svg";

const items = [
  { label: "Dashboard", Icon: DashboardIcon },
  { label: "Automations", Icon: BoltIcon },
  { label: "Campaigns", Icon: DraftsIcon },
  { label: "Analytics", Icon: BarChartIcon },
  { label: "Docs", Icon: MenuBookIcon },
];

export default function EditorSidebar() {
  const [active, setActive] = useState(1);

  return (
    <nav
      aria-label="Primary"
      className="hidden w-[70px] shrink-0 flex-col items-center gap-8 px-4 py-5 sm:flex"
    >
      <LogoIcon aria-label="Buzzing" role="img" className="size-8 shrink-0" />

      <div className="flex min-h-0 flex-1 flex-col items-center gap-5">
        <Button variant="round" size="icon-lg" aria-label="Create automation">
          <PlusIcon aria-hidden className="size-[15px]" />
        </Button>

        <ul
          style={{ "--nav-index": active } as CSSProperties}
          className="relative flex flex-col gap-2.5"
        >
          <span
            aria-hidden
            className="ease-smooth-in-out absolute top-2 left-[-17px] h-5 w-0.5 translate-y-[calc(var(--nav-index)*46px)] rounded-r-[4px] bg-white shadow-[2px_0_8px_1px_rgb(255_255_255/0.25)] transition-transform duration-300 motion-reduce:transition-none"
          />
          {items.map(({ label, Icon }, index) => (
            <li key={label}>
              <Button
                variant="nav"
                size="icon-lg"
                aria-label={label}
                aria-current={active === index ? "page" : undefined}
                onClick={() => setActive(index)}
              >
                <Icon aria-hidden className="size-5" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <Button variant="ghost" size="icon" aria-label="Settings">
        <CogIcon
          aria-hidden
          className="ease-power3-in-out size-5 text-white/32 transition-colors duration-150 group-hover:text-white/60"
        />
      </Button>
    </nav>
  );
}
