"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/_ui/shadcn/sonner";
import { TooltipProvider } from "@/components/_ui/shadcn/tooltip";
import { useAppStore } from "@/stores/app-store";
import EditorSidebar from "./editor-sidebar";
import EditorTopbar from "./editor-topbar";
import EditorTabs from "./editor-tabs";
import WorkflowCanvas from "./workflow/workflow-canvas";
import Automations from "./automations/automations";
import Overview from "./overview/overview";
import Settings from "./settings/settings";
import Export from "./export/export";

type EditorAppProps = {
  avatarSrc: string;
  textureSrc: string;
};

const divider =
  "relative h-1 shrink-0 bg-[#111114] after:absolute after:inset-x-0 after:top-[1.25px] after:h-[1.5px] after:bg-black/32 after:shadow-[0_1px_0_rgb(83_86_101/0.06),0_0.5px_0_rgb(83_86_101/0.06)]";

export default function EditorApp({ avatarSrc, textureSrc }: EditorAppProps) {
  const screen = useAppStore((state) => state.screen);
  const tab = useAppStore((state) => state.tab);
  const automationId = useAppStore((state) => state.automationId);
  const automationName = useAppStore(
    (state) =>
      state.automations.find((item) => item.id === state.automationId)?.name,
  );

  useEffect(() => {
    if (!automationName) return;
    document.title = `Workflow - ${automationName}`;
  }, [automationName]);

  return (
    <TooltipProvider>
      <EditorSidebar />
      <div className="flex min-w-0 flex-1 p-1.5">
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[10px] bg-[#111114] shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_0_2px_rgb(0_0_0/0.3)]">
          <EditorTopbar avatarSrc={avatarSrc} />
          <div aria-hidden className={divider} />

          {screen === "editor" && (
            <>
              <EditorTabs />
              <div aria-hidden className={`${divider} hidden sm:block`} />
              {tab === "workflow" && <WorkflowCanvas />}
              {tab === "overview" && (
                <Overview
                  key={automationId}
                  variant="automation"
                  textureSrc={textureSrc}
                />
              )}
              {tab === "settings" && <Settings key={automationId} />}
              {tab === "export" && <Export key={automationId} />}
              <div aria-hidden className={`${divider} sm:hidden`} />
              <EditorTabs bottom />
            </>
          )}
          {screen === "automations" && <Automations />}
          {screen === "dashboard" && (
            <Overview variant="dashboard" textureSrc={textureSrc} />
          )}

          <div className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.035),inset_0_0_0_1px_rgb(255_255_255/0.02)]" />
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
