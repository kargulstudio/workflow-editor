"use client";

import { clsx } from "clsx";
import type { CSSProperties } from "react";
import type { ActionKind } from "@/stores/workflow-store";
import DragIcon from "@/public/assets/images/home/editor/workflow/drag.svg";
import { ACTIONS } from "./workflow-actions";

type WorkflowGhostProps = {
  kind: ActionKind;
  x: number;
  y: number;
  snapped: boolean;
};

export default function WorkflowGhost({
  kind,
  x,
  y,
  snapped,
}: WorkflowGhostProps) {
  const { Icon, label, theme } = ACTIONS[kind];

  return (
    <div
      aria-hidden
      style={{ "--ghost-x": `${x}px`, "--ghost-y": `${y}px` } as CSSProperties}
      className="pointer-events-none fixed top-0 left-0 z-50 [translate:var(--ghost-x)_var(--ghost-y)]"
    >
      <div
        data-snapped={snapped || undefined}
        className={clsx(
          theme,
          "ease-power3-out flex h-9 w-[280px] cursor-grabbing items-center rounded-[8px] bg-[#1b1b20]/95 px-1 py-1.5 shadow-[0_24px_48px_rgb(0_0_0/0.24),0_10px_18px_rgb(0_0_0/0.2),0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.24),inset_0_1px_0_rgb(255_255_255/0.06),inset_0_0_0_1px_rgb(253_253_255/0.06)] backdrop-blur-md transition-[opacity,scale] duration-150 data-snapped:scale-[0.96] data-snapped:opacity-60 motion-reduce:transition-none starting:scale-[0.96] starting:opacity-0",
        )}
      >
        <span className="flex shrink-0 items-center pl-1">
          <Icon aria-hidden className="size-[18px] text-(--accent)" />
        </span>
        <span className="flex min-w-0 flex-1 items-center pr-4 pl-2 text-[14px] leading-6 font-medium text-white">
          {label}
        </span>
        <span className="flex items-center justify-end pr-0.5">
          <DragIcon aria-hidden className="size-4 text-white/60" />
        </span>
      </div>
    </div>
  );
}
