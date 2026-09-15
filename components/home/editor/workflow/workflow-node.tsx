"use client";

import { memo, useEffect, useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { clsx } from "clsx";
import Button from "@/components/_ui/button";
import type { WorkflowNode as WorkflowNodeData } from "@/stores/workflow-store";
import DragIcon from "@/public/assets/images/home/editor/workflow/drag.svg";
import { ACTIONS } from "./workflow-actions";
import { hasInput } from "./workflow-geometry";

type WorkflowNodeProps = {
  node: WorkflowNodeData;
  selected: boolean;
  targeted: boolean;
  dragging: boolean;
  onMeasure: (id: string, height: number) => void;
  onNodePointerDown: (id: string, event: ReactPointerEvent) => void;
  onHandlePointerDown: (id: string, event: ReactPointerEvent) => void;
  onDelete: () => void;
};

const handleClass =
  "absolute left-1/2 size-2 -translate-x-1/2 rounded-full bg-(--accent) shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_30%,transparent),0_0.667px_1.333px_rgb(0_0_0/0.08),inset_0_-0.333px_0_rgb(0_0_0/0.24),inset_0_0.667px_0_rgb(255_255_255/0.32)]";

function WorkflowNode({
  node,
  selected,
  targeted,
  dragging,
  onMeasure,
  onNodePointerDown,
  onHandlePointerDown,
  onDelete,
}: WorkflowNodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const action = ACTIONS[node.kind];
  const { Icon } = action;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      onMeasure(node.id, element.offsetHeight),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [node.id, onMeasure]);

  return (
    <div
      ref={ref}
      data-node={node.id}
      data-selected={selected || undefined}
      data-targeted={targeted || undefined}
      data-dragging={dragging || undefined}
      style={
        {
          "--node-x": `${node.x}px`,
          "--node-y": `${node.y}px`,
        } as CSSProperties
      }
      className={clsx(
        action.theme,
        "group/node absolute top-0 left-0 w-[400px] [translate:var(--node-x)_var(--node-y)] data-dragging:z-10",
        node.fresh &&
          "ease-power3-out transition-[opacity,scale] duration-200 motion-reduce:transition-none starting:scale-[0.96] starting:opacity-0",
      )}
    >
      <div
        onPointerDown={(event) => onNodePointerDown(node.id, event)}
        className="ease-power3-in-out relative flex cursor-grab flex-col gap-[3px] rounded-[12px] border border-(--accent)/10 bg-(--accent)/10 px-[5px] pt-[5px] pb-[7px] shadow-[0_0_0_1px_rgb(0_0_0/0.04)] backdrop-blur-[16px] transition-[border-color,box-shadow] duration-150 group-data-dragging/node:cursor-grabbing group-data-dragging/node:shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_24px_48px_rgb(0_0_0/0.32),0_8px_16px_rgb(0_0_0/0.24)] group-data-selected/node:border-(--accent)/45 group-data-targeted/node:border-(--accent)/70 group-data-targeted/node:shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_0_0_4px_color-mix(in_srgb,var(--accent)_16%,transparent)]"
      >
        <div className="flex h-9 items-center px-1 py-1.5">
          <div className="flex shrink-0 items-center pl-1">
            <Icon aria-hidden className="size-[18px] text-(--accent)" />
          </div>
          <div className="flex min-w-0 flex-1 items-center pr-4 pl-2">
            <span className="truncate text-[14px] leading-6 font-medium text-(--accent)">
              {action.label}
            </span>
          </div>
          <div className="ease-power3-in-out flex items-center justify-end pr-0.5 opacity-0 transition-opacity duration-150 group-hover/node:opacity-100">
            <DragIcon aria-hidden className="size-4 text-white/60" />
          </div>
          {node.kind === "trigger" && (
            <span className="relative ml-0 flex h-5 items-center overflow-clip rounded-[21px] bg-[#6f3fff]/15 bg-[linear-gradient(176.7deg,rgb(255_255_255/0.02)_3.85%,rgb(255_255_255/0.014)_28%,rgb(255_255_255/0.008)_49%,rgb(255_255_255/0)_75%)] px-[9px] text-[12px] leading-6 font-bold text-[#ab8fff] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_0_0_1px_rgb(253_253_255/0.04)] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]">
              IF
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 rounded-[10px] bg-(--accent-body) px-3.5 py-3 text-[14px]">
          <span
            className={clsx(
              "font-semibold text-white",
              node.kind === "trigger" ? "leading-6" : "leading-5",
            )}
          >
            {node.title}
          </span>
          <span className="leading-5 font-medium text-white/40">
            {node.description}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.03),inset_0_0_0_1px_rgb(252_253_255/0.03)]" />
      </div>

      {hasInput(node) && (
        <span aria-hidden className={clsx(handleClass, "-top-1")} />
      )}

      <span
        role="presentation"
        onPointerDown={(event) => onHandlePointerDown(node.id, event)}
        className={clsx(
          handleClass,
          "-bottom-1 cursor-crosshair before:absolute before:-inset-2 before:rounded-full",
        )}
      />

      {selected && !dragging && (
        <div
          onPointerDown={(event) => event.stopPropagation()}
          className="ease-power3-out absolute -top-9 right-0 transition-[opacity,translate] duration-150 starting:translate-y-1 starting:opacity-0"
        >
          <Button variant="field" size="xs" onClick={onDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}

export default memo(WorkflowNode);
