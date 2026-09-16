"use client";

import type { CSSProperties } from "react";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import type { Automation } from "@/data/automations";
import { STATUS_LABEL } from "@/stores/app-store";
import { useWorkflowStore } from "@/stores/workflow-store";
import { STATUS_TONE } from "../editor-topbar";
import { ACTIONS } from "../workflow/workflow-actions";
import { relativeTime } from "./automations-utils";

type AutomationsGridProps = {
  automations: Automation[];
  now: number;
  onOpen: (id: string) => void;
};

export default function AutomationsGrid({
  automations,
  now,
  onOpen,
}: AutomationsGridProps) {
  const exportGraph = useWorkflowStore((state) => state.exportGraph);

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
      {automations.map((automation, index) => {
        const graph = exportGraph(automation.id);
        const steps = graph.nodes.toSorted((a, b) => a.y - b.y || a.x - b.x);
        const edited = relativeTime(automation.updatedAt, now);
        return (
          <li
            key={automation.id}
            style={
              { "--delay": `${Math.min(index, 8) * 40}ms` } as CSSProperties
            }
            className="animate-fade-in [animation-delay:var(--delay)]"
          >
            <Button
              variant="bare"
              size="bare"
              onClick={() => onOpen(automation.id)}
              className="group ease-power3-in-out relative flex h-full w-full cursor-pointer flex-col items-stretch justify-start gap-4 overflow-clip rounded-[16px] bg-[#141417] p-5 text-left whitespace-normal shadow-[0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)] transition-[background-color,box-shadow] duration-200 outline-none hover:bg-[#17171b] focus-visible:shadow-[0_0_0_2px_rgb(127_89_240/0.6)]"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="text-[16px] leading-6 font-[550] text-white">
                  {automation.name}
                </span>
                <Tag tone={STATUS_TONE[automation.status]}>
                  {STATUS_LABEL[automation.status]}
                </Tag>
              </span>
              <span className="line-clamp-2 min-h-10 text-[14px] leading-5 font-normal text-white/50">
                {automation.description}
              </span>
              <span
                className="flex flex-wrap items-center gap-1"
                aria-label={`${steps.length} steps`}
              >
                {steps.slice(0, 8).map((step) => {
                  const action = ACTIONS[step.kind];
                  return (
                    <span
                      key={step.id}
                      title={step.title}
                      className={`${action.theme} flex size-7 items-center justify-center rounded-[8px] bg-(--accent)/10 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_16%,transparent)]`}
                    >
                      <action.Icon
                        aria-hidden
                        className="size-4 text-(--accent)"
                      />
                    </span>
                  );
                })}
                {steps.length > 8 && (
                  <span className="px-1 text-[12px] font-[550] text-white/40">
                    +{steps.length - 8}
                  </span>
                )}
              </span>
              <span className="mt-auto flex items-center justify-between gap-3 text-[12px] leading-4 text-white/50 tabular-nums">
                <span className="min-w-0 truncate">
                  <span className="font-[550] text-white">
                    {automation.enrolled}
                  </span>{" "}
                  enrolled ·{" "}
                  <span className="font-[550] text-white">
                    {automation.completed}
                  </span>{" "}
                  completed
                </span>
                <span className="shrink-0">
                  {edited.value
                    ? `${edited.value} ${edited.unit}`
                    : edited.unit}
                </span>
              </span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
