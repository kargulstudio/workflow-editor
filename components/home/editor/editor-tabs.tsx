"use client";

import SegmentedTabs from "@/components/_ui/segmented-tabs";
import { useAppStore, type EditorTab } from "@/stores/app-store";

const TABS: { value: EditorTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "workflow", label: "Workflow" },
  { value: "settings", label: "Settings" },
  { value: "export", label: "Export" },
];

export default function EditorTabs({ bottom }: { bottom?: boolean }) {
  const tab = useAppStore((state) => state.tab);
  const setTab = useAppStore((state) => state.setTab);

  if (bottom) {
    return (
      <div className="shrink-0 bg-[#111114] px-4 py-2 sm:hidden">
        <SegmentedTabs
          label="Automation sections"
          items={TABS}
          value={tab}
          onChange={setTab}
          className="grid-cols-4 [&>button]:px-2"
        />
      </div>
    );
  }

  return (
    <div className="no-scrollbar hidden shrink-0 items-start overflow-x-auto bg-[#111114] px-4 py-2 sm:flex sm:h-[51px]">
      <SegmentedTabs
        label="Automation sections"
        items={TABS}
        value={tab}
        onChange={setTab}
      />
    </div>
  );
}
