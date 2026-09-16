"use client";

import { useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { toast } from "sonner";
import Asset from "@/components/_ui/asset";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/_ui/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import PersonalInfoIcon from "@/public/assets/images/home/editor/profile/personal-info.svg";
import AccountSecurityIcon from "@/public/assets/images/home/editor/profile/account-security.svg";
import TemplatesIcon from "@/public/assets/images/home/editor/profile/templates.svg";
import UsersIcon from "@/public/assets/images/home/editor/profile/users.svg";
import SettingsIcon from "@/public/assets/images/home/editor/profile/settings.svg";
import LogoutIcon from "@/public/assets/images/home/editor/profile/logout.svg";
import SparklesIcon from "@/public/assets/images/home/editor/profile/sparkles.svg";
import PlusIcon from "@/public/assets/images/home/editor/profile/plus.svg";

type ProfileMenuProps = {
  avatarSrc: string;
};

type MenuEntry = {
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  onSelect: () => void;
};

const divider =
  "h-0.5 shrink-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.32)_0,rgb(0_0_0/0.32)_1.5px,rgb(83_86_101/0.06)_1.5px)]";

const menuItem =
  "h-9 gap-0 rounded-[8px] px-1 text-[14px] leading-6 font-medium text-white data-[highlighted]:bg-white/5";

export default function ProfileMenu({ avatarSrc }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const automationId = useAppStore((state) => state.automationId);
  const openAutomation = useAppStore((state) => state.openAutomation);

  const entries: MenuEntry[] = [
    {
      label: "Personal info",
      Icon: PersonalInfoIcon,
      onSelect: () =>
        toast("Personal info", {
          description: "Marcel Kargul · marcel@buzzing.email",
        }),
    },
    {
      label: "Account Security",
      Icon: AccountSecurityIcon,
      onSelect: () =>
        toast.success("Two-factor authentication is on", {
          description: "Last sign-in from Lisbon, 2 minutes ago.",
        }),
    },
    {
      label: "Templates",
      Icon: TemplatesIcon,
      onSelect: () =>
        toast("8 templates in your library", {
          description: "Open the Actions panel and pick Template to use one.",
        }),
    },
    {
      label: "Manage users",
      Icon: UsersIcon,
      onSelect: () =>
        toast("3 people have access", {
          description: "Marcel (owner), Leo (editor), Priya (viewer).",
        }),
    },
    {
      label: "Settings",
      Icon: SettingsIcon,
      onSelect: () => openAutomation(automationId, "settings"),
    },
  ];

  return (
    <>
      <div
        aria-hidden
        data-open={open || undefined}
        className="ease-power3-out pointer-events-none fixed inset-0 z-40 bg-black/25 opacity-0 backdrop-blur-[3px] transition-opacity duration-200 data-open:opacity-100 motion-reduce:backdrop-blur-none"
      />
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          aria-label="Open profile menu"
          className="ease-power3-in-out relative size-8 shrink-0 cursor-pointer overflow-clip rounded-[8px] bg-white shadow-[0_1.5px_3px_-0.75px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.4)] transition-[box-shadow] duration-150 outline-none hover:shadow-[0_1.5px_3px_-0.75px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.4),0_0_0_4px_rgb(255_255_255/0.08)] focus-visible:ring-2 focus-visible:ring-[#7f59f0]/60 data-[state=open]:shadow-[0_1.5px_3px_-0.75px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.4),0_0_0_4px_rgb(255_255_255/0.12)]"
        >
          <Asset
            type="image"
            src={avatarSrc}
            alt=""
            width={1}
            height={1}
            className="absolute inset-0 size-auto rounded-[8px]"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={16}
          collisionPadding={8}
          className="flex w-[min(350px,calc(100vw-16px))] flex-col gap-px overflow-clip rounded-[16px] bg-[#17171c]/80 bg-[radial-gradient(circle_at_43px_11px,rgb(255_255_255/0.08),transparent_200px)] p-0 shadow-[-10px_32px_64px_2px_rgb(0_0_0/0.5),0_24px_48px_rgb(0_0_0/0.12),0_10px_18px_rgb(0_0_0/0.12),0_5px_8px_rgb(0_0_0/0.16),0_2px_4px_rgb(0_0_0/0.16),0_0_0_1.7px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)] backdrop-blur-[10px]"
        >
          <div className="p-3">
            <div className="flex items-center gap-3 rounded-[8px] px-2 py-1.5">
              <span className="relative size-9 shrink-0 overflow-clip rounded-[9px] bg-white shadow-[0_1.5px_3px_-0.75px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.4)]">
                <Asset
                  type="image"
                  src={avatarSrc}
                  alt=""
                  width={1}
                  height={1}
                  className="absolute inset-0 size-auto"
                />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[14px] leading-5 font-[550] text-white">
                  @marcelkargul
                </span>
                <span className="text-[12px] leading-4 font-normal text-white/60">
                  Personal
                </span>
              </span>
            </div>
          </div>

          <div aria-hidden className={divider} />

          <div className="p-2.5">
            <DropdownMenuGroup className="flex h-[120px] flex-col gap-1.5 rounded-[12px] bg-black/24 px-2 py-2.5 shadow-[0_0_0_1px_rgb(0_0_0/0.12),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
              <span className="px-2 py-[3px] text-[12px] leading-4 font-[550] text-white/50">
                Switch Workspaces
              </span>
              <div className="flex flex-col gap-0.5">
                <DropdownMenuItem
                  className="h-9 justify-between gap-3 rounded-[8px] px-2 data-[highlighted]:bg-white/5"
                  onSelect={() => toast("You’re already in Marcel’s workspace")}
                >
                  <span className="flex items-center gap-3">
                    <span className="relative flex size-6 items-center justify-center rounded-[6px] bg-[#e471cd] text-[12px] leading-3 font-medium tracking-[-0.18px] text-white shadow-[0_1px_2px_-0.5px_rgb(0_0_0/0.08),0_0_0_0.5px_rgb(0_0_0/0.12),inset_0_0.5px_0_rgb(255_255_255/0.04)]">
                      M
                    </span>
                    <span className="text-[14px] leading-5 font-[550] text-white">
                      Marcel’s workspace
                    </span>
                  </span>
                  <span className="text-[12px] leading-4 font-normal text-white/60">
                    Free
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="h-9 justify-between gap-3 rounded-[8px] px-2 data-[highlighted]:bg-white/5"
                  onSelect={() =>
                    toast("More workspaces are on the Pro plan", {
                      description:
                        "Upgrade to invite teams into separate workspaces.",
                    })
                  }
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-6 items-center justify-center rounded-[6px] bg-[#1b1b20] shadow-[0_4px_8px_rgb(0_0_0/0.08),0_2px_4px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.16),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]">
                      <PlusIcon aria-hidden className="size-2.5 text-white" />
                    </span>
                    <span className="text-[14px] leading-5 font-medium text-white/60">
                      Create new
                    </span>
                  </span>
                  <span className="relative flex h-6 items-center gap-1 overflow-clip rounded-[8px] bg-[#2013d3]/14 bg-[linear-gradient(178deg,rgb(255_255_255/0.02)_3.85%,rgb(255_255_255/0.014)_28%,rgb(255_255_255/0.008)_49%,rgb(255_255_255/0)_75%)] px-1.5 text-[12px] leading-6 font-medium text-[#6359f0] shadow-[0_4px_10px_2px_rgb(42_30_202/0.12),0_1px_2px_rgb(0_0_0/0.08),0_1px_0_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.16),inset_0_1px_0_rgb(255_255_255/0.01),inset_0_0_0_1px_rgb(253_253_255/0.04)] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32),0_4px_6px_rgb(99_89_240/0.4)]">
                    <SparklesIcon aria-hidden className="size-3.5" />
                    Upgrade
                  </span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuGroup>
          </div>

          <div aria-hidden className={divider} />

          <DropdownMenuGroup className="flex flex-col gap-0.5 p-3">
            {entries.map(({ label, Icon, onSelect }) => (
              <DropdownMenuItem
                key={label}
                className={menuItem}
                onSelect={onSelect}
              >
                <span className="flex items-center pl-0.5">
                  <Icon aria-hidden className="size-5 text-white/60" />
                </span>
                <span className="flex-1 pr-4 pl-3">{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <div aria-hidden className={divider} />

          <div className="px-3 py-2.5">
            <DropdownMenuItem
              className={cn(menuItem)}
              onSelect={() =>
                toast("You’re still signed in", {
                  description: "Logging out is disabled in this preview.",
                })
              }
            >
              <span className="flex items-center pl-0.5">
                <LogoutIcon aria-hidden className="size-5 text-white/60" />
              </span>
              <span className="flex-1 pr-4 pl-3">Logout</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
