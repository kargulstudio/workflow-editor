"use client";

import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/_ui/button";
import Divider from "@/components/_ui/divider";
import IconBadge from "@/components/_ui/icon-badge";
import Tag from "@/components/_ui/tag";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/_ui/shadcn/dialog";
import { useAppStore } from "@/stores/app-store";
import { useWorkflowStore } from "@/stores/workflow-store";
import WebhookIcon from "@/public/assets/images/home/editor/workflow/webhook.svg";
import CloseIcon from "@/public/assets/images/home/editor/workflow/zoom-in.svg";

const TOOLS = [
  {
    name: "list_steps",
    description: "Read every step, branch and connection in this automation.",
  },
  {
    name: "enroll_subscriber",
    description: "Drop someone into the workflow from the trigger.",
  },
  {
    name: "run_once",
    description: "Trace a test subscriber end to end and return the path.",
  },
  {
    name: "read_logs",
    description: "Pull the log for the most recent run.",
  },
];

function copy(value: string, label: string) {
  navigator.clipboard?.writeText(value).catch(() => {});
  toast.success(`${label} copied`, {
    description: "Paste it into your MCP client and reload it.",
  });
}

export default function McpConnect() {
  const [open, setOpen] = useState(false);
  const automation = useAppStore((state) =>
    state.automations.find((item) => item.id === state.automationId),
  );
  const steps = useWorkflowStore((state) => state.nodes.length);
  const slug = automation?.id ?? "automation";

  const config = `{
  "mcpServers": {
    "buzzing": {
      "command": "npx",
      "args": [
        "-y",
        "@buzzing/mcp",
        "--automation", "${slug}"
      ],
      "env": { "BUZZING_API_KEY": "sk_live_•••••" }
    }
  }
}`;

  const prompt = `Enroll sarah@example.com in “${automation?.name ?? "this automation"}”, run it once, then tell me which branch she lands on and why.`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="field" size="field" className="hidden md:inline-flex">
          <WebhookIcon aria-hidden className="size-[18px] text-white/60" />
          <span className="pr-1">Connect MCP</span>
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <div className="flex shrink-0 items-start justify-between gap-4 p-[18px]">
          <div className="flex min-w-0 items-center gap-3.5">
            <IconBadge>
              <WebhookIcon className="size-[22px] text-white" />
            </IconBadge>
            <div className="flex min-w-0 flex-col">
              <DialogTitle>Connect to MCP</DialogTitle>
              <DialogDescription>
                Let Claude or any MCP client drive this automation.
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close">
              <CloseIcon
                aria-hidden
                className="ease-power3-in-out size-[18px] rotate-45 text-white/70 transition-colors duration-150 group-hover:text-white"
              />
            </Button>
          </DialogClose>
        </div>
        <Divider />

        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-[18px]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] leading-5 font-medium text-white/70">
                Server config
              </span>
              <Button
                variant="field"
                size="field"
                className="px-2.5"
                onClick={() => copy(config, "Config")}
              >
                Copy
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-[12px] bg-black/30 px-4 py-3 font-mono text-[12.5px] leading-5 text-white/75 shadow-[0_0_0_1px_rgb(0_0_0/0.24),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
              <code>{config}</code>
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] leading-5 font-medium text-white/70">
                Then try this prompt
              </span>
              <Button
                variant="field"
                size="field"
                className="px-2.5"
                onClick={() => copy(prompt, "Prompt")}
              >
                Copy
              </Button>
            </div>
            <p className="rounded-[12px] bg-white/2 px-4 py-3 text-[13px] leading-5 text-white/75 shadow-[0_0_0_1px_rgb(0_0_0/0.12),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
              {prompt}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] leading-5 font-medium text-white/70">
              Tools it exposes
            </span>
            <div className="flex flex-col gap-1">
              {TOOLS.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-baseline gap-3 rounded-[10px] px-2 py-1.5"
                >
                  <span className="shrink-0 font-mono text-[12.5px] leading-5 text-[#75ffd3]">
                    {tool.name}
                  </span>
                  <span className="min-w-0 text-[13px] leading-5 text-white/45">
                    {tool.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Divider />
        <div className="flex shrink-0 items-center justify-between gap-3 p-[18px]">
          <span className="flex items-center gap-2">
            <Tag tone="neutral">Not connected</Tag>
            <span className="hidden text-[13px] leading-5 text-white/40 sm:inline">
              {steps} steps exposed
            </span>
          </span>
          <Button
            variant="accent"
            size="field"
            className="px-3"
            onClick={() => {
              copy(config, "Config");
              setOpen(false);
            }}
          >
            Copy config &amp; close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
