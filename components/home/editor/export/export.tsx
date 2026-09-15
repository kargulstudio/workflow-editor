"use client";

import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/_ui/button";
import { Input } from "@/components/_ui/field";
import { Switch } from "@/components/_ui/shadcn/switch";
import Tag from "@/components/_ui/tag";
import { cn } from "@/lib/utils";
import { DEFAULT_SETTINGS, useAppStore } from "@/stores/app-store";
import { useWorkflowStore } from "@/stores/workflow-store";
import WebhookIcon from "@/public/assets/images/home/editor/workflow/webhook.svg";
import UsersIcon from "@/public/assets/images/home/editor/workflow/users-plus.svg";
import LayoutIcon from "@/public/assets/images/home/editor/workflow/layout.svg";
import RowInsertIcon from "@/public/assets/images/home/editor/workflow/row-insert.svg";
import ShareIcon from "@/public/assets/images/home/editor/topbar/share.svg";
import PostsIcon from "@/public/assets/images/home/editor/overview/posts.svg";
import SettingsSection, { SettingsRow } from "../settings/settings-section";
import ExportPreview from "./export-preview";
import {
  FORMAT_META,
  buildExport,
  fileName,
  type ExportFormat,
} from "./export-formats";

const FORMAT_ICONS = {
  json: { Icon: WebhookIcon, theme: "[--accent:#ffb575]" },
  csv: { Icon: UsersIcon, theme: "[--accent:#75aaff]" },
  markdown: { Icon: LayoutIcon, theme: "[--accent:#ff75e3]" },
};

function copy(text: string, message: string) {
  navigator.clipboard
    ?.writeText(text)
    .then(() => toast.success(message))
    .catch(() => toast("Copy isn’t available in this browser"));
}

function formatBytes(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

export default function Export() {
  const automation = useAppStore((state) =>
    state.automations.find((item) => item.id === state.automationId),
  );
  const settings = useAppStore(
    (state) => state.settings[state.automationId] ?? DEFAULT_SETTINGS,
  );
  const updateSettings = useAppStore((state) => state.updateSettings);
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const logs = useWorkflowStore((state) => state.logs);
  const [format, setFormat] = useState<ExportFormat>("json");
  const [includeRules, setIncludeRules] = useState(true);
  const [includeLogs, setIncludeLogs] = useState(false);

  if (!automation) return null;

  const content = buildExport(format, automation, { nodes, edges }, logs, {
    includeRules,
    includeLogs,
  });
  const name = fileName(automation, format);
  const size = new Blob([content]).size;
  const shareUrl = `https://buzzing.email/a/${automation.id}`;
  const curl = `curl -X POST https://api.buzzing.email/v1/automations/${automation.id}/enroll \\\n  -H "Authorization: Bearer $BUZZING_API_KEY" \\\n  -d '{ "email": "reader@example.com" }'`;

  const download = () => {
    const url = URL.createObjectURL(
      new Blob([content], { type: FORMAT_META[format].mime }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${name}`, {
      description: `${nodes.length} steps · ${formatBytes(size)}`,
    });
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
      <div className="mx-auto flex w-full max-w-[1358px] flex-col gap-10 px-4 pt-8 pb-16 sm:px-8 xl:px-20">
        <div className="flex flex-col gap-1.5">
          <span
            role="heading"
            aria-level={1}
            className="text-[24px] leading-8 font-semibold text-white"
          >
            Export
          </span>
          <span className="text-[14px] leading-6 font-normal text-white/60">
            Take {automation.name} anywhere — download the workflow, share a
            read-only link or trigger it from your own code.
          </span>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <SettingsSection
            id="export-format"
            title="Format"
            description="Pick what you want to take with you."
            icon={<RowInsertIcon className="size-5 -scale-y-100 text-white" />}
          >
            <div
              role="radiogroup"
              aria-label="Export format"
              className="flex flex-col gap-2"
            >
              {(Object.keys(FORMAT_META) as ExportFormat[]).map((value) => {
                const meta = FORMAT_META[value];
                const { Icon, theme } = FORMAT_ICONS[value];
                const selected = value === format;
                return (
                  <Button
                    key={value}
                    variant="bare"
                    size="bare"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setFormat(value)}
                    className={cn(
                      theme,
                      "ease-power3-in-out justify-start gap-3.5 rounded-[12px] bg-white/2 p-3.5 text-left whitespace-normal shadow-[0_0_0_1px_rgb(0_0_0/0.12),inset_0_0_0_1px_rgb(255_255_255/0.04)] transition-[background-color,box-shadow] duration-150 hover:bg-white/4 aria-checked:bg-(--accent)/6 aria-checked:shadow-[0_0_0_1px_rgb(0_0_0/0.12),inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_45%,transparent)]",
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-(--accent)/10 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_18%,transparent)]">
                      <Icon
                        aria-hidden
                        className="size-[18px] text-(--accent)"
                      />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[14px] leading-5 font-[550] text-white">
                        {meta.label}
                      </span>
                      <span className="text-[13px] leading-5 font-normal text-white/50">
                        {meta.description}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="ease-power3-out flex size-4 shrink-0 items-center justify-center rounded-full shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.2)] transition-shadow duration-150 group-aria-checked:shadow-[inset_0_0_0_1.5px_var(--accent)]"
                    >
                      <span className="ease-power3-out size-2 scale-50 rounded-full bg-(--accent) opacity-0 transition-[opacity,scale] duration-150 group-aria-checked:scale-100 group-aria-checked:opacity-100" />
                    </span>
                  </Button>
                );
              })}
            </div>
            <SettingsRow
              title="Include step rules"
              description="Conditions, subjects and timings you set in the step panel."
              htmlFor="export-rules"
            >
              <Switch
                id="export-rules"
                checked={includeRules}
                disabled={format !== "json"}
                onCheckedChange={setIncludeRules}
              />
            </SettingsRow>
            <SettingsRow
              title="Include latest test run"
              description={
                logs.length
                  ? `${logs.length} log entries from Run once.`
                  : "Use Run once on the Workflow tab first."
              }
              htmlFor="export-logs"
            >
              <Switch
                id="export-logs"
                checked={includeLogs}
                disabled={!logs.length || format === "csv"}
                onCheckedChange={setIncludeLogs}
              />
            </SettingsRow>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="accent"
                size="field"
                className="px-3"
                onClick={download}
              >
                <RowInsertIcon
                  aria-hidden
                  className="size-[18px] text-white/80"
                />
                <span className="pr-1">
                  Download {FORMAT_META[format].extension.toUpperCase()}
                </span>
              </Button>
              <Button
                variant="field"
                size="field"
                className="px-3"
                onClick={() => copy(content, "Copied to clipboard")}
              >
                Copy contents
              </Button>
            </div>
          </SettingsSection>

          <section
            aria-label="Preview"
            className="relative flex h-[min(640px,calc(100dvh-220px))] min-h-[420px] flex-col gap-3 overflow-clip rounded-[16px] bg-[#141417] p-4 shadow-[0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.12)] xl:sticky xl:top-0"
          >
            <div className="flex items-center justify-between gap-3 px-1">
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-[#ff7575]" />
                <span className="size-2 shrink-0 rounded-full bg-[#ffb575]" />
                <span className="size-2 shrink-0 rounded-full bg-[#75ff77]" />
                <span className="ml-2 truncate font-mono text-[12.5px] leading-5 text-white/60">
                  {name}
                </span>
              </span>
              <Tag tone="neutral" className="tabular-nums">
                {formatBytes(size)}
              </Tag>
            </div>
            <ExportPreview key={format} content={content} format={format} />
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]" />
          </section>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <SettingsSection
            id="export-share"
            title="Share"
            description="A read-only view of the workflow canvas."
            icon={<ShareIcon className="size-5 text-white" />}
          >
            <SettingsRow
              title="Public link"
              description="Anyone with the link can view — never edit — this automation."
              htmlFor="export-share-toggle"
            >
              <Switch
                id="export-share-toggle"
                checked={settings.shareLink}
                onCheckedChange={(shareLink) =>
                  updateSettings(automation.id, { shareLink })
                }
              />
            </SettingsRow>
            <div
              data-disabled={!settings.shareLink || undefined}
              className="ease-power3-in-out flex gap-3 transition-opacity duration-200 data-disabled:opacity-40"
            >
              <Input
                aria-label="Share link"
                readOnly
                value={shareUrl}
                disabled={!settings.shareLink}
                className="font-mono text-[13px]"
              />
              <Button
                variant="field"
                size="field"
                className="h-9 shrink-0 px-3"
                disabled={!settings.shareLink}
                onClick={() => copy(shareUrl, "Share link copied")}
              >
                Copy link
              </Button>
            </div>
          </SettingsSection>

          <SettingsSection
            id="export-api"
            title="Trigger from your code"
            description="Enroll subscribers with a single request."
            icon={<PostsIcon className="size-[22px] text-white" />}
            action={
              <Button
                variant="field"
                size="field"
                className="px-3"
                onClick={() => copy(curl, "cURL command copied")}
              >
                Copy
              </Button>
            }
          >
            <pre className="overflow-x-auto rounded-[12px] bg-black/30 px-4 py-3 font-mono text-[12.5px] leading-5 text-white/75 shadow-[0_0_0_1px_rgb(0_0_0/0.24),inset_0_0_0_1px_rgb(255_255_255/0.04)] [scrollbar-width:thin]">
              <code>
                <span className="text-[#75ffd3]">curl</span>
                {curl.slice(4)}
              </code>
            </pre>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
