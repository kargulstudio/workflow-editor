"use client";

import Button from "@/components/_ui/button";
import SelectField from "@/components/_ui/select-field";
import { Field, Input } from "@/components/_ui/field";
import { useAppStore } from "@/stores/app-store";
import type { ActionKind, WorkflowNode } from "@/stores/workflow-store";
import PlusIcon from "@/public/assets/images/home/editor/profile/plus.svg";
import BackspaceIcon from "@/public/assets/images/home/editor/workflow/backspace.svg";

type RuleField =
  | { key: string; label: string; type: "select"; options: readonly string[] }
  | {
      key: string;
      label: string;
      type: "text" | "time" | "number";
      placeholder?: string;
    }
  | { key: string; label: string; type: "automation" };

type Condition = { field: string; operator: string; value: string };

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const RULE_FIELDS: Record<Exclude<ActionKind, "branch">, RuleField[]> = {
  trigger: [
    {
      key: "source",
      label: "Signup source",
      type: "select",
      options: [
        "Any source",
        "Homepage form",
        "Referral link",
        "CSV import",
        "API",
      ],
    },
    {
      key: "tag",
      label: "Only subscribers tagged",
      type: "text",
      placeholder: "e.g. newsletter",
    },
  ],
  "send-email": [
    {
      key: "subject",
      label: "Subject line",
      type: "text",
      placeholder: "Welcome to the hive 🐝",
    },
    {
      key: "template",
      label: "Template",
      type: "select",
      options: ["Welcome", "Plain text", "Weekly digest", "Announcement"],
    },
  ],
  "update-subscription": [
    {
      key: "action",
      label: "Action",
      type: "select",
      options: ["Add tag", "Remove tag", "Move to list", "Unsubscribe"],
    },
    {
      key: "value",
      label: "Tag or list",
      type: "text",
      placeholder: "onboarded",
    },
  ],
  "send-webhook": [
    {
      key: "method",
      label: "Method",
      type: "select",
      options: ["POST", "PUT", "PATCH"],
    },
    {
      key: "url",
      label: "Endpoint URL",
      type: "text",
      placeholder: "https://hooks.buzzing.email/crm",
    },
  ],
  "wait-until": [
    { key: "day", label: "Day", type: "select", options: DAYS },
    { key: "time", label: "Time", type: "time" },
  ],
  "time-delay": [
    { key: "amount", label: "Wait for", type: "number", placeholder: "2" },
    {
      key: "unit",
      label: "Unit",
      type: "select",
      options: ["minutes", "hours", "days", "weeks"],
    },
  ],
  enroll: [{ key: "automation", label: "Automation", type: "automation" }],
};

const RULE_DEFAULTS: Record<string, string> = {
  source: "Any source",
  template: "Welcome",
  action: "Add tag",
  method: "POST",
  day: "Monday",
  time: "09:00",
  amount: "2",
  unit: "days",
};

const CONDITION_FIELDS = [
  "Opened Email 1",
  "Clicked any link",
  "Has tag",
  "Signup source",
  "Country",
];
const OPERATORS = ["is", "is not"];

function formatTime(value: string) {
  const [hours = "9", minutes = "00"] = value.split(":");
  const hour = Number(hours);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minutes} ${suffix}`;
}

function parseConditions(node: WorkflowNode): Condition[] {
  try {
    return JSON.parse(node.rules?.conditions ?? "[]") as Condition[];
  } catch {
    return [];
  }
}

export function deriveNode(node: WorkflowNode, rules: Record<string, string>) {
  const value = (key: string) => rules[key] ?? RULE_DEFAULTS[key] ?? "";
  switch (node.kind) {
    case "wait-until":
      return { title: `${value("day")} at ${formatTime(value("time"))}` };
    case "time-delay": {
      const amount = Number(value("amount")) || 1;
      const unit = value("unit");
      return {
        title: `Wait ${amount} ${amount === 1 ? unit.replace(/s$/, "") : unit}`,
      };
    }
    case "enroll":
      return rules.automation ? { title: rules.automation } : {};
    case "branch": {
      const conditions = JSON.parse(rules.conditions ?? "[]") as Condition[];
      const first = conditions[0];
      return {
        title: `Branch on ${conditions.length} condition${conditions.length === 1 ? "" : "s"}`,
        description: first
          ? conditions
              .map(
                (item) =>
                  `${item.field} ${item.operator === "is" ? "=" : "≠"} ${item.value}`,
              )
              .join(" and ")
          : "Need to add a condition, e.g., Opened Email 1 = True",
      };
    }
    default:
      return {};
  }
}

type NodePanelRulesProps = {
  node: WorkflowNode;
  onChange: (rules: Record<string, string>) => void;
};

export default function NodePanelRules({
  node,
  onChange,
}: NodePanelRulesProps) {
  const automations = useAppStore((state) => state.automations);
  const rules = node.rules ?? {};
  const set = (key: string, value: string) =>
    onChange({ ...rules, [key]: value });

  if (node.kind === "branch") {
    const conditions = parseConditions(node);
    const write = (next: Condition[]) =>
      onChange({ ...rules, conditions: JSON.stringify(next) });
    return (
      <div className="flex flex-col gap-2">
        {conditions.map((condition, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_88px_96px_36px] gap-2"
          >
            <SelectField
              value={condition.field}
              options={CONDITION_FIELDS}
              onChange={(field) =>
                write(
                  conditions.map((item, at) =>
                    at === index ? { ...item, field } : item,
                  ),
                )
              }
            />
            <SelectField
              value={condition.operator}
              options={OPERATORS}
              onChange={(operator) =>
                write(
                  conditions.map((item, at) =>
                    at === index ? { ...item, operator } : item,
                  ),
                )
              }
            />
            <Input
              aria-label="Condition value"
              value={condition.value}
              onChange={(event) =>
                write(
                  conditions.map((item, at) =>
                    at === index
                      ? { ...item, value: event.target.value }
                      : item,
                  ),
                )
              }
            />
            <Button
              variant="brick"
              size="icon-lg"
              aria-label="Remove condition"
              onClick={() => write(conditions.filter((_, at) => at !== index))}
            >
              <BackspaceIcon
                aria-hidden
                className="size-[18px] text-[#e33e31]"
              />
            </Button>
          </div>
        ))}
        <Button
          variant="field"
          size="field"
          className="w-fit"
          onClick={() =>
            write([
              ...conditions,
              { field: "Opened Email 1", operator: "is", value: "True" },
            ])
          }
        >
          <span className="flex size-5 items-center justify-center">
            <PlusIcon aria-hidden className="size-3" />
          </span>
          <span className="pr-1">Add condition</span>
        </Button>
      </div>
    );
  }

  const fields = RULE_FIELDS[node.kind];
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
      {fields.map((field) => {
        const id = `${node.id}-${field.key}`;
        const value = rules[field.key] ?? RULE_DEFAULTS[field.key] ?? "";
        const wide = field.type === "text" || field.type === "automation";
        return (
          <Field
            key={field.key}
            label={field.label}
            htmlFor={id}
            className={wide ? "col-span-2" : undefined}
          >
            {field.type === "select" ? (
              <SelectField
                id={id}
                value={value}
                options={field.options}
                onChange={(next) => set(field.key, next)}
              />
            ) : field.type === "automation" ? (
              <SelectField
                id={id}
                value={value || automations[1]?.name || ""}
                options={automations.map((automation) => automation.name)}
                onChange={(next) => set(field.key, next)}
              />
            ) : (
              <Input
                id={id}
                type={field.type}
                min={field.type === "number" ? 1 : undefined}
                placeholder={field.placeholder}
                value={value}
                onChange={(event) => set(field.key, event.target.value)}
                className="[color-scheme:dark]"
              />
            )}
          </Field>
        );
      })}
    </div>
  );
}
