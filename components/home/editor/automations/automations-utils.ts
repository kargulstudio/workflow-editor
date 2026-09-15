import { useEffect, useState } from "react";
import type {
  Automation,
  AutomationCategory,
  AutomationStatus,
} from "@/data/automations";

export const SORTS = [
  "creation date",
  "last edited",
  "name",
  "subscribers enrolled",
] as const;
export type Sort = (typeof SORTS)[number];

export const CATEGORIES: {
  value: AutomationCategory | "all";
  label: string;
}[] = [
  { value: "all", label: "All automations" },
  { value: "welcome", label: "Welcome series" },
  { value: "engagement", label: "Engagement" },
  { value: "nurture", label: "Nurture" },
];

export const STATUSES: AutomationStatus[] = ["draft", "running", "paused"];

export type Filters = {
  sort: Sort;
  descending: boolean;
  category: AutomationCategory | "all";
  statuses: AutomationStatus[];
  query: string;
};

export function applyFilters(automations: Automation[], filters: Filters) {
  const query = filters.query.trim().toLowerCase();
  const direction = filters.descending ? -1 : 1;
  return automations
    .filter(
      (automation) =>
        filters.category === "all" || automation.category === filters.category,
    )
    .filter(
      (automation) =>
        !filters.statuses.length ||
        filters.statuses.includes(automation.status),
    )
    .filter(
      (automation) =>
        !query ||
        automation.name.toLowerCase().includes(query) ||
        automation.description.toLowerCase().includes(query),
    )
    .toSorted((a, b) => {
      switch (filters.sort) {
        case "name":
          return a.name.localeCompare(b.name) * -direction;
        case "last edited":
          return (a.updatedAt - b.updatedAt) * direction;
        case "subscribers enrolled":
          return (a.enrolled - b.enrolled) * direction;
        default:
          return (a.createdAt - b.createdAt) * direction;
      }
    });
}

export function relativeTime(time: number, now: number) {
  const seconds = Math.round((now - time) / 1000);
  if (seconds < 45) return { value: "", unit: "just now" };
  const minutes = Math.round(seconds / 60);
  if (minutes < 60)
    return {
      value: String(minutes),
      unit: minutes === 1 ? "minute ago" : "minutes ago",
    };
  const hours = Math.round(minutes / 60);
  if (hours < 24)
    return {
      value: String(hours),
      unit: hours === 1 ? "hour ago" : "hours ago",
    };
  const days = Math.round(hours / 24);
  return { value: String(days), unit: days === 1 ? "day ago" : "days ago" };
}

export function useNow(interval = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(timer);
  }, [interval]);
  return now;
}
