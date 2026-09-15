"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import Divider from "@/components/_ui/divider";
import SegmentedTabs from "@/components/_ui/segmented-tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/_ui/shadcn/dropdown-menu";
import {
  useWorkflowStore,
  type ActionKind,
  type InspectorTab,
} from "@/stores/workflow-store";
import ExpandIcon from "@/public/assets/images/home/editor/workflow/expand.svg";
import RowInsertIcon from "@/public/assets/images/home/editor/workflow/row-insert.svg";
import { ACTIONS, ACTION_GROUPS } from "../workflow-actions";
import NodePanelBuild from "./node-panel-build";
import NodePanelStatus from "./node-panel-status";
import NodePanelLogs from "./node-panel-logs";

const TABS = [
  { value: "build", label: "Build" },
  { value: "status", label: "Status" },
  { value: "logs", label: "Logs" },
] as const;

type NodePanelProps = {
  onFocusNode: (id: string) => void;
  onAppend: (sourceId: string, kind: ActionKind) => void;
};

export default function NodePanel({ onFocusNode, onAppend }: NodePanelProps) {
  const [open, setOpen] = useState(true);
  const inspector = useWorkflowStore((state) => state.inspector);
  const node = useWorkflowStore((state) =>
    state.nodes.find((item) => item.id === state.inspector?.nodeId),
  );
  const next = useWorkflowStore((state) =>
    state.edges.find((edge) => edge.source === state.inspector?.nodeId),
  );
  const setTab = useWorkflowStore((state) => state.setInspectorTab);
  const openInspector = useWorkflowStore((state) => state.openInspector);

  if (!inspector || !node) return null;

  const goNext = () => {
    if (!next) return;
    openInspector(next.target);
    onFocusNode(next.target);
  };

  return (
    <aside
      aria-label={`${ACTIONS[node.kind].label} settings`}
      onPointerDown={(event) => event.stopPropagation()}
      data-canvas-overlay
      className="ease-power3-out absolute top-4 right-4 z-30 flex max-h-[calc(100%-180px)] min-h-[260px] w-[min(480px,calc(100%-32px))] flex-col overflow-clip rounded-[16px] bg-[#17171c] bg-[radial-gradient(circle_at_42px_-16px,rgb(255_255_255/0.07),transparent_220px)] shadow-[0_24px_48px_rgb(0_0_0/0.12),0_10px_18px_rgb(0_0_0/0.12),0_5px_8px_rgb(0_0_0/0.16),0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.12)] transition-[opacity,translate] duration-200 motion-reduce:transition-none starting:translate-x-3 starting:opacity-0"
    >
      <div className="flex shrink-0 items-center justify-between px-[18px] py-3.5">
        <SegmentedTabs
          label="Step panels"
          items={TABS}
          value={inspector.tab}
          onChange={(tab: InspectorTab) => {
            setTab(tab);
            setOpen(true);
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          aria-expanded={open}
          aria-label={open ? "Collapse step panel" : "Expand step panel"}
          onClick={() => setOpen((value) => !value)}
        >
          <ExpandIcon
            aria-hidden
            className="ease-power3-in-out size-[18px] text-white/70 transition-colors duration-150 group-hover:text-white"
          />
        </Button>
      </div>

      <div
        data-open={open || undefined}
        inert={!open}
        className="ease-smooth-in-out grid min-h-0 grid-rows-[0fr] transition-[grid-template-rows] duration-300 data-open:grid-rows-[1fr] motion-reduce:transition-none"
      >
        <div className="flex min-h-0 flex-col overflow-hidden">
          <Divider />
          <div
            key={`${node.id}-${inspector.tab}`}
            className="animate-fade-in min-h-0 overflow-y-auto px-5 py-[18px]"
          >
            {inspector.tab === "build" && <NodePanelBuild node={node} />}
            {inspector.tab === "status" && <NodePanelStatus node={node} />}
            {inspector.tab === "logs" && <NodePanelLogs node={node} />}
          </div>
          <Divider />
          <div className="shrink-0 px-[18px] py-4">
            {next ? (
              <Button variant="accent" size="block" onClick={goNext}>
                <RowInsertIcon
                  aria-hidden
                  className="size-[18px] -scale-y-100"
                />
                <span className="font-semibold">Next step</span>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="accent" size="block">
                    <RowInsertIcon
                      aria-hidden
                      className="size-[18px] -scale-y-100"
                    />
                    <span className="font-semibold">Add next step</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  className="w-(--radix-dropdown-menu-trigger-width)"
                >
                  {ACTION_GROUPS.map((group) => (
                    <div key={group.label}>
                      <DropdownMenuLabel className="uppercase">
                        {group.label}
                      </DropdownMenuLabel>
                      {group.kinds.map((kind) => {
                        const option = ACTIONS[kind];
                        return (
                          <DropdownMenuItem
                            key={kind}
                            className={option.theme}
                            onSelect={() => onAppend(node.id, kind)}
                          >
                            <option.Icon
                              aria-hidden
                              className="size-4 text-(--accent)"
                            />
                            {option.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]" />
    </aside>
  );
}
