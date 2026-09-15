"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/_ui/button";
import { useAppStore } from "@/stores/app-store";

export default function EditorTitle() {
  const automation = useAppStore((state) =>
    state.automations.find((item) => item.id === state.automationId),
  );
  const renameRequest = useAppStore((state) => state.renameRequest);
  const updateAutomation = useAppStore((state) => state.updateAutomation);
  const [draft, setDraft] = useState<string | null>(null);
  const handledRename = useRef(renameRequest);
  const cancelled = useRef(false);

  useEffect(() => {
    if (handledRename.current === renameRequest || !automation) return;
    handledRename.current = renameRequest;
    queueMicrotask(() => setDraft(automation.name));
  }, [automation, renameRequest]);

  if (!automation) return null;

  const startEditing = () => {
    cancelled.current = false;
    setDraft(automation.name);
  };

  const commit = () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    const name = draft?.trim();
    if (name && name !== automation.name)
      updateAutomation(automation.id, { name });
    setDraft(null);
  };

  return (
    <div className="absolute top-1/2 left-1/2 hidden max-w-[min(420px,40%)] -translate-x-1/2 -translate-y-1/2 lg:block">
      {draft === null ? (
        <Button
          variant="ghost"
          size="title"
          title="Double-click to rename"
          onDoubleClick={startEditing}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === "F2") startEditing();
          }}
          className="cursor-text"
        >
          <span className="truncate">{automation.name}</span>
        </Button>
      ) : (
        <span className="inline-grid max-w-full">
          <span
            aria-hidden
            className="invisible col-start-1 row-start-1 truncate px-1.5 text-[14px] leading-6 font-[550] whitespace-pre"
          >
            {draft || " "}
          </span>
          <input
            autoFocus
            onFocus={(event) => event.currentTarget.select()}
            aria-label="Automation name"
            value={draft}
            maxLength={60}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") commit();
              if (event.key === "Escape") {
                cancelled.current = true;
                setDraft(null);
              }
            }}
            className="col-start-1 row-start-1 min-w-[4ch] rounded-[6px] bg-white/4 px-1.5 text-center text-[14px] leading-6 font-[550] text-white shadow-[0_0_0_1px_#7445ff,0_0_0_4px_rgb(117_71_255/0.2)] outline-none"
          />
        </span>
      )}
    </div>
  );
}
