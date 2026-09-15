"use client";

import SegmentedTabs from "@/components/_ui/segmented-tabs";
import { useAppStore, type EditorTab } from "@/stores/app-store";

const TABS: { value: EditorTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "workflow", label: "Workflow" },
  { value: "settings", label: "Settings" },
  { value: "export", label: "Export" },
];

export default function EditorTabs() {
  const tab = useAppStore((state) => state.tab);
  const setTab = useAppStore((state) => state.setTab);

  return (
    <div className="flex h-[51px] shrink-0 items-start overflow-x-auto bg-[#111114] px-4 py-2 no-scrollbar">
      <SegmentedTabs
        label="Automation sections"
        items={TABS}
        value={tab}
        onChange={setTab}
      />
    </div>
  );
}
