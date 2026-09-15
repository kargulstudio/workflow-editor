"use client";

import type { CSSProperties } from "react";
import { useAppStore } from "@/stores/app-store";
import { useWorkflowStore, type WorkflowNode } from "@/stores/workflow-store";
import { cn } from "@/lib/utils";
import { ACTIONS } from "../workflow-actions";

type NodePanelStatusProps = {
  node: WorkflowNode;
};

function seeded(id: string) {
  let hash = 0;
  for (const character of id)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return (hash % 1000) / 1000;
}

function relative(time: number | null) {
  if (!time) return "Never";
  const seconds = Math.max(1, Math.round((Date.now() - time) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

export default function NodePanelStatus({ node }: NodePanelStatusProps) {
  const run = useWorkflowStore((state) => state.run);
  const edges = useWorkflowStore((state) => state.edges);
  const logs = useWorkflowStore((state) => state.logs);
  const automation = useAppStore((state) =>
    state.automations.find((item) => item.id === state.automationId),
  );
  const action = ACTIONS[node.kind];

  const lastLog = [...logs].reverse().find((log) => log.nodeId === node.id);
  const state =
    run.activeNodeId === node.id
      ? "running"
      : run.visited.includes(node.id)
        ? "done"
        : lastLog
          ? "idle"
          : "never";

  const label = {
    running: "Running now",
    done: "Completed in the last test run",
    idle: "Ready",
    never: "Waiting for its first run",
  }[state];

  const base = automation?.enrolled ?? 0;
  const ratio = 0.55 + seeded(node.id) * 0.4;
  const entered = Math.round(base * (0.7 + seeded(`${node.id}-in`) * 0.3));
  const completed = Math.round(entered * ratio);
  const dropOff = entered ? Math.round((1 - completed / entered) * 100) : 0;
  const incoming = edges.filter((edge) => edge.target === node.id).length;
  const outgoing = edges.filter((edge) => edge.source === node.id).length;
  const truthy = Math.round(40 + seeded(`${node.id}-branch`) * 40);

  const metrics = [
    { label: "Entered", value: entered.toLocaleString() },
    { label: "Completed", value: completed.toLocaleString() },
    { label: "Drop-off", value: `${dropOff}%` },
  ];

  return (
    <div className={cn("flex flex-col gap-4", action.theme)}>
      <div className="flex items-center gap-3 rounded-[12px] bg-white/2 px-3.5 py-3 shadow-[0_0_0_1px_rgb(0_0_0/0.12),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
        <span className="relative flex size-2.5 shrink-0">
          {state === "running" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-(--accent) opacity-60 motion-reduce:animate-none" />
          )}
          <span
            className={cn(
              "relative size-2.5 rounded-full",
              state === "never"
                ? "bg-white/20"
                : "bg-(--accent) shadow-[0_0_8px_var(--accent)]",
            )}
          />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[14px] leading-5 font-[550] text-white">
            {label}
          </span>
          <span className="text-[12px] leading-4 text-white/50">
            Last activity {relative(lastLog?.time ?? null)} · {incoming} in ·{" "}
            {outgoing} out
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex flex-col gap-1 rounded-[12px] bg-white/2 px-3.5 py-3 shadow-[0_0_0_1px_rgb(0_0_0/0.12),inset_0_0_0_1px_rgb(255_255_255/0.04)]"
          >
            <span className="text-[12px] leading-4 font-[550] text-white/50">
              {metric.label}
            </span>
            <span className="font-display text-[24px] leading-8 text-white tabular-nums">
              {metric.value}
            </span>
          </div>
        ))}
      </div>

      {node.kind === "branch" && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] leading-6 font-[550] text-white/50">
            Path split
          </span>
          <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
            <span
              className="h-full w-(--split) bg-(--accent)"
              style={{ "--split": `${truthy}%` } as CSSProperties}
            />
          </div>
          <div className="flex justify-between text-[12px] leading-4 font-[550] tabular-nums">
            <span className="text-(--accent)">TRUE · {truthy}%</span>
            <span className="text-white/50">FALSE · {100 - truthy}%</span>
          </div>
        </div>
      )}

      {!base && (
        <span className="block text-[12px] leading-4 text-white/40">
          This automation hasn’t enrolled anyone yet. Use Run once to send a
          test subscriber through it.
        </span>
      )}
    </div>
  );
}
