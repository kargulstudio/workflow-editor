"use client";

import type { PointerEvent as ReactPointerEvent, Ref } from "react";
import Button from "@/components/_ui/button";
import type { ActionKind } from "@/stores/workflow-store";
import ExpandIcon from "@/public/assets/images/home/editor/workflow/expand.svg";
import LayoutIcon from "@/public/assets/images/home/editor/workflow/layout.svg";
import ChevronRightIcon from "@/public/assets/images/home/editor/workflow/chevron-right.svg";
import { ACTION_GROUPS } from "../workflow-actions";
import ActionsPanelItem from "./actions-panel-item";

type ActionsPanelProps = {
  ref?: Ref<HTMLElement>;
  open: boolean;
  draggingKind: ActionKind | null;
  onToggle: () => void;
  onItemPointerDown: (kind: ActionKind, event: ReactPointerEvent) => void;
  onAdd: (kind: ActionKind) => void;
};

const divider =
  "h-0.5 shrink-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.32)_0,rgb(0_0_0/0.32)_1.5px,rgb(83_86_101/0.06)_1.5px)]";

export default function ActionsPanel({
  ref,
  open,
  draggingKind,
  onToggle,
  onItemPointerDown,
  onAdd,
}: ActionsPanelProps) {
  return (
    <aside
      ref={ref}
      aria-label="Actions"
      onPointerDown={(event) => event.stopPropagation()}
      className="absolute top-4 left-4 z-20 flex max-h-[calc(100%-32px)] w-[min(320px,calc(100%-32px))] flex-col overflow-clip rounded-[12px] bg-[#131317] shadow-[0_24px_48px_rgb(0_0_0/0.12),0_10px_18px_rgb(0_0_0/0.12),0_5px_8px_rgb(0_0_0/0.16),0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.12)]"
    >
      <div className="flex h-[52px] shrink-0 items-center justify-between px-[18px] py-2.5">
        <span className="text-[14px] leading-6 font-[550] text-white text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]">
          Actions
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-expanded={open}
          aria-controls="actions-panel-body"
          aria-label={open ? "Collapse actions" : "Expand actions"}
          onClick={onToggle}
        >
          <ExpandIcon
            aria-hidden
            className="ease-power3-in-out size-[18px] text-white/70 transition-colors duration-150 group-hover:text-white"
          />
        </Button>
      </div>

      <div
        id="actions-panel-body"
        data-open={open || undefined}
        inert={!open}
        className="ease-smooth-in-out grid min-h-0 grid-rows-[0fr] transition-[grid-template-rows] duration-300 data-open:grid-rows-[1fr] motion-reduce:transition-none"
      >
        <div className="flex min-h-0 flex-col overflow-hidden">
          <div className={divider} />
          <div className="min-h-0 overflow-y-auto px-5 py-[18px] [scrollbar-width:none]">
            <div className="flex flex-col gap-4">
              {ACTION_GROUPS.map((group) => (
                <section
                  key={group.label}
                  aria-label={group.label}
                  className="flex flex-col gap-0.5"
                >
                  <div className="flex h-8 items-center py-1.5">
                    <span className="text-[12px] leading-6 font-[550] text-white/50 uppercase">
                      {group.label}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-0.5">
                    {group.kinds.map((kind) => (
                      <ActionsPanelItem
                        key={kind}
                        kind={kind}
                        dragging={draggingKind === kind}
                        onPointerDown={onItemPointerDown}
                        onAdd={onAdd}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
          <div className={divider} />
          <div className="flex h-[52px] shrink-0 items-center justify-between px-[18px] py-2.5">
            <span className="flex items-center gap-2">
              <LayoutIcon aria-hidden className="size-[18px] text-white/50" />
              <span className="text-[14px] leading-6 font-[550] text-white text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]">
                Template
              </span>
            </span>
            <Button variant="ghost" size="icon" aria-label="Browse templates">
              <ChevronRightIcon
                aria-hidden
                className="ease-power3-in-out size-[18px] text-white/50 transition-colors duration-150 group-hover:text-white"
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]" />
    </aside>
  );
}
