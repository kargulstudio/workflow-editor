"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import { cn } from "@/lib/utils";
import { useWorkflowStore, type WorkflowNode } from "@/stores/workflow-store";
import PlayIcon from "@/public/assets/images/home/editor/topbar/play.svg";
import { startRun } from "../workflow-run";

type NodePanelLogsProps = {
  node: WorkflowNode;
};

const LEVEL_DOT = {
  info: "bg-white/40",
  success: "bg-[#59f089] shadow-[0_0_6px_rgb(89_240_137/0.6)]",
  warning: "bg-[#ffb575] shadow-[0_0_6px_rgb(255_181_117/0.6)]",
};

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export default function NodePanelLogs({ node }: NodePanelLogsProps) {
  const [scope, setScope] = useState<"step" | "all">("step");
  const logs = useWorkflowStore((state) => state.logs);
  const running = useWorkflowStore((state) => state.run.status === "running");
  const visible = [...logs]
    .reverse()
    .filter((log) => scope === "all" || log.nodeId === node.id);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-[9px] bg-[#121215] p-0.5 shadow-[0_0_0_1px_rgb(0_0_0/0.24),inset_0_2px_4px_rgb(0_0_0/0.2)]">
          {(["step", "all"] as const).map((value) => (
            <Button
              key={value}
              variant="ghost"
              size="xs"
              aria-pressed={scope === value}
              onClick={() => setScope(value)}
              className="rounded-[7px] text-white/50 aria-pressed:bg-[#1f1f25] aria-pressed:text-white aria-pressed:shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
            >
              {value === "step" ? "This step" : "All steps"}
            </Button>
          ))}
        </div>
        <span className="text-[12px] leading-4 text-white/40 tabular-nums">
          {visible.length} {visible.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {visible.length ? (
        <ol className="flex flex-col overflow-hidden rounded-[12px] bg-black/20 shadow-[0_0_0_1px_rgb(0_0_0/0.16),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
          {visible.map((log) => (
            <li
              key={log.id}
              className="animate-fade-in flex items-start gap-3 px-3.5 py-2.5 not-last:shadow-[0_1px_0_rgb(0_0_0/0.24),0_2px_0_rgb(255_255_255/0.02)]"
            >
              <span
                className={cn(
                  "mt-[7px] size-1.5 shrink-0 rounded-full",
                  LEVEL_DOT[log.level],
                )}
              />
              <span className="min-w-0 flex-1 text-[13px] leading-5 text-white/80">
                {log.message}
              </span>
              <span className="shrink-0 text-[12px] leading-5 text-white/35 tabular-nums">
                #{log.run} · {timeFormat.format(log.time)}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-[12px] bg-black/20 px-6 py-8 text-center shadow-[0_0_0_1px_rgb(0_0_0/0.16),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
          <span className="text-[14px] leading-5 font-[550] text-white">
            No logs yet
          </span>
          <span className="max-w-[26em] text-[13px] leading-5 text-white/50">
            Send a test subscriber through the workflow to see what each step
            does.
          </span>
          <Button
            variant="accent"
            size="field"
            disabled={running}
            onClick={() => startRun()}
          >
            <PlayIcon aria-hidden className="size-5 text-white/80" />
            <span className="pr-1">{running ? "Running…" : "Run once"}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
