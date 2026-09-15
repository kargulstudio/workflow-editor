"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";

const tabs = ["Overview", "Workflow", "Settings", "Export"];

export default function EditorTabs() {
  const [active, setActive] = useState("Workflow");

  return (
    <div className="flex h-[51px] shrink-0 items-start overflow-x-auto bg-[#111114] px-4 py-2 [scrollbar-width:none]">
      <div
        role="tablist"
        aria-label="Automation sections"
        className="flex gap-0.5 rounded-[9px] bg-[#121215] p-px shadow-[0_0_0_1px_rgb(0_0_0/0.24),0_1px_1px_rgb(0_0_0/0.05),inset_0_2px_4px_rgb(0_0_0/0.2),inset_0_1.048px_2.096px_rgb(0_0_0/0.05)]"
      >
        {tabs.map((tab) => (
          <Button
            key={tab}
            variant="tab"
            size="tab"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>
    </div>
  );
}
