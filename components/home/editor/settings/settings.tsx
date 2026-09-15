"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/_ui/button";
import SegmentedTabs from "@/components/_ui/segmented-tabs";
import SelectField from "@/components/_ui/select-field";
import { Field, Input, Textarea } from "@/components/_ui/field";
import { Switch } from "@/components/_ui/shadcn/switch";
import { cn } from "@/lib/utils";
import { DEFAULT_SETTINGS, useAppStore } from "@/stores/app-store";
import type { AutomationStatus } from "@/data/automations";
import BoltIcon from "@/public/assets/images/home/editor/automations/bolt.svg";
import MailIcon from "@/public/assets/images/home/editor/overview/mail.svg";
import UserIcon from "@/public/assets/images/home/editor/overview/user.svg";
import BackspaceIcon from "@/public/assets/images/home/editor/workflow/backspace.svg";
import SettingsSection, { SettingsRow } from "./settings-section";

const STATUS_ITEMS: { value: AutomationStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "running", label: "Running" },
  { value: "paused", label: "Paused" },
];

const TIMEZONES = [
  "Subscriber’s timezone",
  "Europe/Lisbon (GMT+1)",
  "America/New_York (GMT-4)",
  "Asia/Kolkata (GMT+5:30)",
  "Australia/Sydney (GMT+10)",
];

const SECTIONS = [
  { id: "settings-general", label: "General" },
  { id: "settings-sending", label: "Sending" },
  { id: "settings-enrollment", label: "Enrollment" },
  { id: "settings-danger", label: "Danger zone" },
];

export default function Settings() {
  const automation = useAppStore((state) =>
    state.automations.find((item) => item.id === state.automationId),
  );
  const settings = useAppStore(
    (state) => state.settings[state.automationId] ?? DEFAULT_SETTINGS,
  );
  const updateAutomation = useAppStore((state) => state.updateAutomation);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const duplicateAutomation = useAppStore((state) => state.duplicateAutomation);
  const deleteAutomation = useAppStore((state) => state.deleteAutomation);
  const [confirming, setConfirming] = useState(false);
  const [active, setActive] = useState(SECTIONS[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { root, rootMargin: "0px 0px -60% 0px" },
    );
    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  if (!automation) return null;
  const set = (patch: Partial<typeof settings>) =>
    updateSettings(automation.id, patch);

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto box-content flex max-w-[1200px] flex-col gap-10 px-4 pt-8 pb-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span
              role="heading"
              aria-level={1}
              className="text-[24px] leading-8 font-semibold text-white"
            >
              Settings
            </span>
            <span className="text-[14px] leading-6 font-normal text-white/60">
              Control how {automation.name} sends, who can enter it and when it
              stops.
            </span>
          </div>
          <span className="flex items-center gap-2 text-[13px] leading-5 font-medium text-white/50">
            <span className="size-1.5 rounded-full bg-[#59f089] shadow-[0_0_6px_rgb(89_240_137/0.6)]" />
            Changes save automatically
          </span>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[200px_1fr]">
          <nav
            aria-label="Settings sections"
            className="sticky top-0 hidden flex-col gap-0.5 lg:flex"
          >
            {SECTIONS.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                size="bare"
                aria-current={active === section.id ? "true" : undefined}
                onClick={() =>
                  document
                    .getElementById(section.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="relative h-8 justify-start px-3 text-[14px] leading-6 font-medium text-white/50 transition-colors hover:text-white/80 aria-[current=true]:bg-white/4 aria-[current=true]:text-white"
              >
                {section.label}
              </Button>
            ))}
          </nav>

          <div className="flex min-w-0 flex-col gap-6">
            <SettingsSection
              id="settings-general"
              title="General"
              description="Name, purpose and whether this automation is live."
              icon={<BoltIcon className="size-[22px] text-white" />}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Automation name" htmlFor="settings-name">
                  <Input
                    id="settings-name"
                    value={automation.name}
                    onChange={(event) =>
                      updateAutomation(automation.id, {
                        name: event.target.value,
                      })
                    }
                  />
                </Field>
                <Field
                  label="Goal"
                  htmlFor="settings-goal"
                  hint="Used to measure conversion on the Overview tab."
                >
                  <Input
                    id="settings-goal"
                    value={settings.goal}
                    onChange={(event) => set({ goal: event.target.value })}
                  />
                </Field>
              </div>
              <Field label="Description" htmlFor="settings-description">
                <Textarea
                  id="settings-description"
                  className="min-h-[88px]"
                  value={automation.description}
                  onChange={(event) =>
                    updateAutomation(automation.id, {
                      description: event.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Status">
                <SegmentedTabs
                  label="Automation status"
                  items={STATUS_ITEMS}
                  value={automation.status}
                  onChange={(status) => {
                    updateAutomation(automation.id, { status });
                    toast.success(
                      status === "running"
                        ? "Automation is live"
                        : status === "paused"
                          ? "Automation paused"
                          : "Moved back to draft",
                      {
                        description:
                          status === "running"
                            ? "New subscribers will enter from the next trigger."
                            : "No one new will enter until you resume it.",
                      },
                    );
                  }}
                />
              </Field>
            </SettingsSection>

            <SettingsSection
              id="settings-sending"
              title="Sending"
              description="Who emails come from and when they are allowed to go out."
              icon={<MailIcon className="size-[22px] text-white" />}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Sender name" htmlFor="settings-sender">
                  <Input
                    id="settings-sender"
                    value={settings.senderName}
                    onChange={(event) =>
                      set({ senderName: event.target.value })
                    }
                  />
                </Field>
                <Field label="Reply-to address" htmlFor="settings-reply">
                  <Input
                    id="settings-reply"
                    type="email"
                    value={settings.replyTo}
                    onChange={(event) => set({ replyTo: event.target.value })}
                  />
                </Field>
              </div>
              <Field label="Send using">
                <SelectField
                  value={settings.timezone}
                  options={TIMEZONES}
                  onChange={(timezone) => set({ timezone })}
                />
              </Field>
              <SettingsRow
                title="Quiet hours"
                description="Hold emails that would land overnight and send them in the morning."
                htmlFor="settings-quiet"
              >
                <Switch
                  id="settings-quiet"
                  checked={settings.quietHours}
                  onCheckedChange={(quietHours) => set({ quietHours })}
                />
              </SettingsRow>
              <div
                data-disabled={!settings.quietHours || undefined}
                className="ease-power3-in-out grid gap-5 transition-opacity duration-200 data-disabled:opacity-40 md:grid-cols-2"
              >
                <Field label="Hold from" htmlFor="settings-quiet-from">
                  <Input
                    id="settings-quiet-from"
                    type="time"
                    disabled={!settings.quietHours}
                    value={settings.quietFrom}
                    onChange={(event) => set({ quietFrom: event.target.value })}
                    className="[color-scheme:dark]"
                  />
                </Field>
                <Field label="Until" htmlFor="settings-quiet-to">
                  <Input
                    id="settings-quiet-to"
                    type="time"
                    disabled={!settings.quietHours}
                    value={settings.quietTo}
                    onChange={(event) => set({ quietTo: event.target.value })}
                    className="[color-scheme:dark]"
                  />
                </Field>
              </div>
              <SettingsRow
                title="Skip weekends"
                description="Delays and waits pause on Saturday and Sunday."
                htmlFor="settings-weekends"
              >
                <Switch
                  id="settings-weekends"
                  checked={settings.skipWeekends}
                  onCheckedChange={(skipWeekends) => set({ skipWeekends })}
                />
              </SettingsRow>
            </SettingsSection>

            <SettingsSection
              id="settings-enrollment"
              title="Enrollment"
              description="Rules for entering and leaving this automation."
              icon={<UserIcon className="size-[22px] text-white" />}
              action={
                <span className="hidden text-[13px] leading-5 font-medium text-white/50 tabular-nums sm:inline">
                  <span className="text-white">{automation.enrolled}</span>{" "}
                  enrolled ·{" "}
                  <span className="text-white">{automation.completed}</span>{" "}
                  completed
                </span>
              }
            >
              <SettingsRow
                title="Allow re-entry"
                description="Subscribers can go through again after they finish."
                htmlFor="settings-reentry"
              >
                <Switch
                  id="settings-reentry"
                  checked={settings.reentry}
                  onCheckedChange={(reentry) => set({ reentry })}
                />
              </SettingsRow>
              <SettingsRow
                title="Exit on unsubscribe"
                description="Remove people from every step as soon as they unsubscribe."
                htmlFor="settings-exit"
              >
                <Switch
                  id="settings-exit"
                  checked={settings.exitOnUnsubscribe}
                  onCheckedChange={(exitOnUnsubscribe) =>
                    set({ exitOnUnsubscribe })
                  }
                />
              </SettingsRow>
            </SettingsSection>

            <SettingsSection
              id="settings-danger"
              title="Danger zone"
              description="Copy this automation or remove it for good."
              tone="danger"
              icon={<BackspaceIcon className="size-5 text-[#e33e31]" />}
            >
              <SettingsRow
                title="Duplicate automation"
                description="Creates a draft copy with the same steps and settings."
              >
                <Button
                  variant="field"
                  size="field"
                  className="px-3"
                  onClick={() => duplicateAutomation(automation.id)}
                >
                  Duplicate
                </Button>
              </SettingsRow>
              <SettingsRow
                title="Delete automation"
                description="Stops it immediately and removes its history. This can’t be undone."
              >
                <Button
                  variant="field"
                  size="field"
                  aria-live="polite"
                  onClick={() => {
                    if (!confirming) {
                      setConfirming(true);
                      return;
                    }
                    const name = automation.name;
                    deleteAutomation(automation.id);
                    toast(`Deleted “${name}”`);
                  }}
                  className={cn(
                    "px-3 text-[#ff6b61] hover:bg-[#e33e31]/12 hover:text-[#ff8077]",
                    confirming &&
                      "bg-[#e33e31] text-white hover:bg-[#f04a3d] hover:text-white",
                  )}
                >
                  {confirming ? "Click again to delete" : "Delete"}
                </Button>
              </SettingsRow>
            </SettingsSection>
          </div>
        </div>
      </div>
    </div>
  );
}
