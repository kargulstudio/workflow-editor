"use client";

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { clsx } from "clsx";
import type { ActionKind } from "@/stores/workflow-store";
import DragIcon from "@/public/assets/images/home/editor/workflow/drag.svg";
import { ACTIONS } from "../workflow-actions";

type ActionsPanelItemProps = {
  kind: ActionKind;
  dragging: boolean;
  onPointerDown: (kind: ActionKind, event: ReactPointerEvent) => void;
  onAdd: (kind: ActionKind) => void;
};

export default function ActionsPanelItem({
  kind,
  dragging,
  onPointerDown,
  onAdd,
}: ActionsPanelItemProps) {
  const { Icon, label, theme } = ACTIONS[kind];

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onAdd(kind);
  };

  return (
    <li
      role="button"
      tabIndex={0}
      aria-label={`Add ${label}`}
      data-dragging={dragging || undefined}
      onPointerDown={(event) => onPointerDown(kind, event)}
      onKeyDown={handleKeyDown}
      className={clsx(
        theme,
        "group/item ease-power3-in-out relative flex w-full cursor-grab touch-none items-center rounded-[8px] px-1 py-1.5 transition-[background-color,box-shadow,opacity] duration-150 outline-none select-none hover:bg-white/3 hover:shadow-[0_2px_4px_-1px_rgb(0_0_0/0.08),0_1px_1px_-1px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)] focus-visible:bg-white/3 focus-visible:shadow-[0_0_0_1px_rgb(127_89_240/0.6)] active:cursor-grabbing data-dragging:opacity-50",
      )}
    >
      <span className="flex shrink-0 items-center pl-1">
        <Icon aria-hidden className="size-[18px] text-(--accent)" />
      </span>
      <span className="flex min-w-0 flex-1 items-center pr-4 pl-2 text-[14px] leading-6 font-medium text-white">
        {label}
      </span>
      <span className="ease-power3-in-out flex items-center justify-end pr-0.5 opacity-0 transition-opacity duration-150 group-hover/item:opacity-100 group-focus-visible/item:opacity-100">
        <DragIcon aria-hidden className="size-4 text-white/60" />
      </span>
    </li>
  );
}
