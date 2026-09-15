"use client";

import { toast } from "sonner";
import Button from "@/components/_ui/button";
import Tag, { type TagTone } from "@/components/_ui/tag";
import { STATUS_LABEL, useAppStore, type EditorTab } from "@/stores/app-store";
import { useWorkflowStore } from "@/stores/workflow-store";
import type { AutomationStatus } from "@/data/automations";
import ToolbarIcon from "@/public/assets/images/home/editor/topbar/toolbar.svg";
import ChevronIcon from "@/public/assets/images/home/editor/topbar/chevron.svg";
import SearchIcon from "@/public/assets/images/home/editor/topbar/search.svg";
import PlayIcon from "@/public/assets/images/home/editor/topbar/play.svg";
import HelpIcon from "@/public/assets/images/home/editor/topbar/help.svg";
import ShareIcon from "@/public/assets/images/home/editor/topbar/share.svg";
import PencilIcon from "@/public/assets/images/home/editor/topbar/pencil.svg";
import ProfileMenu from "./profile-menu/profile-menu";
import EditorTitle from "./editor-title";
import McpConnect from "./mcp-connect/mcp-connect";
import { startRun, stopRun } from "./workflow/workflow-run";

export const STATUS_TONE: Record<AutomationStatus, TagTone> = {
  draft: "violet",
  running: "green",
  paused: "red",
};

const TAB_LABEL: Record<EditorTab, string> = {
  overview: "Overview",
  workflow: "Workflow",
  settings: "Settings",
  export: "Export",
};

type EditorTopbarProps = {
  avatarSrc: string;
};

function AccountActions({ avatarSrc }: EditorTopbarProps) {
  return (
    <>
      <Button
        variant="field"
        size="field"
        className="hidden md:inline-flex"
        onClick={() =>
          toast("Need a hand?", {
            description: "Our team replies in about 5 minutes on weekdays.",
            action: {
              label: "Open chat",
              onClick: () => toast.success("Chat opened in a new window"),
            },
          })
        }
      >
        <HelpIcon aria-hidden className="size-[18px] text-white/60" />
        <span className="pr-1">Help</span>
      </Button>
      <Button
        variant="field"
        size="field"
        className="hidden md:inline-flex"
        onClick={() => {
          navigator.clipboard
            ?.writeText("https://buzzing.email/r/azharadev")
            .catch(() => {});
          toast.success("Referral link copied", {
            description: "Earn a free month for every writer who joins.",
          });
        }}
      >
        <ShareIcon aria-hidden className="size-[18px] text-white/60" />
        <span className="pr-1">Share &amp; earn</span>
      </Button>
      <ProfileMenu avatarSrc={avatarSrc} />
    </>
  );
}

function WorkflowActions() {
  const running = useWorkflowStore((state) => state.run.status === "running");

  return (
    <>
      <McpConnect />
      <Button
        variant="accent"
        size="field"
        aria-live="polite"
        className="min-w-[114px] justify-start"
        onClick={() => (running ? stopRun() : startRun())}
      >
        <span className="relative flex size-5 items-center justify-center">
          <PlayIcon
            aria-hidden
            data-hidden={running || undefined}
            className="ease-power3-out absolute size-5 text-white/80 transition-[opacity,scale,filter] duration-200 data-hidden:scale-[0.25] data-hidden:opacity-0 data-hidden:blur-[4px]"
          />
          <span
            aria-hidden
            data-hidden={!running || undefined}
            className="ease-power3-out absolute size-3 animate-spin rounded-full border-[1.5px] border-white/25 border-t-white transition-[opacity,scale,filter] duration-200 data-hidden:scale-[0.25] data-hidden:opacity-0 data-hidden:blur-[4px]"
          />
        </span>
        <span className="pr-1">{running ? "Running…" : "Run once"}</span>
      </Button>
    </>
  );
}

export default function EditorTopbar({ avatarSrc }: EditorTopbarProps) {
  const screen = useAppStore((state) => state.screen);
  const tab = useAppStore((state) => state.tab);
  const automations = useAppStore((state) => state.automations);
  const automation = useAppStore((state) =>
    state.automations.find((item) => item.id === state.automationId),
  );
  const openScreen = useAppStore((state) => state.openScreen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);

  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between gap-4 bg-[#111114] p-4">
      <div className="flex min-w-0 items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          aria-pressed={!sidebarOpen}
          onClick={toggleSidebar}
          className="hidden sm:inline-flex"
        >
          <ToolbarIcon
            aria-hidden
            className="ease-power3-in-out size-5 -rotate-90 text-white/50 transition-colors duration-150 group-hover:text-white/80"
          />
        </Button>

        {screen === "dashboard" && (
          <span className="text-[14px] leading-6 font-[550] text-white">
            Dashboard
          </span>
        )}

        {screen === "automations" && (
          <div className="flex items-center gap-3">
            <span className="text-[14px] leading-6 font-[550] text-white">
              Automations
            </span>
            <Tag tone="violet" className="tabular-nums">
              {automations.length} total
            </Tag>
          </div>
        )}

        {screen === "editor" && automation && (
          <div className="flex min-w-0 items-center gap-3">
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center text-[14px] leading-6">
                <li className="hidden md:block">
                  <Button
                    variant="crumb"
                    size="crumb"
                    onClick={() => openScreen("automations")}
                  >
                    Automations
                  </Button>
                </li>
                <li aria-hidden className="hidden md:block">
                  <ChevronIcon className="size-6 text-[#fcfdff]/30" />
                </li>
                <li
                  aria-current="page"
                  className="truncate font-[550] text-white"
                >
                  {TAB_LABEL[tab]}
                </li>
              </ol>
            </nav>
            <Tag tone={STATUS_TONE[automation.status]}>
              {STATUS_LABEL[automation.status]}
            </Tag>
          </div>
        )}
      </div>

      {screen === "editor" && <EditorTitle />}

      <div className="flex shrink-0 items-center gap-3">
        {screen === "dashboard" && (
          <>
            <Button
              variant="field"
              size="field"
              className="hidden md:inline-flex"
              onClick={() => openScreen("automations")}
            >
              <SearchIcon aria-hidden className="size-5 text-white/40" />
              <span className="pr-1">Search</span>
            </Button>
            <Button
              variant="accent"
              size="field"
              onClick={() =>
                toast("New draft started", {
                  description: "Your post will autosave while you write.",
                })
              }
            >
              <PencilIcon aria-hidden className="size-5 text-white/80" />
              <span className="pr-1">Start writing</span>
            </Button>
          </>
        )}
        {screen === "automations" && <AccountActions avatarSrc={avatarSrc} />}
        {screen === "editor" &&
          (tab === "workflow" ? (
            <WorkflowActions />
          ) : (
            <AccountActions avatarSrc={avatarSrc} />
          ))}
      </div>
    </header>
  );
}
