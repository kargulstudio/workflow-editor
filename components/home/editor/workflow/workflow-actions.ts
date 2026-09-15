import type { AssetSvgComponent } from "@/components/_ui/asset/asset-types";
import type { ActionKind } from "@/stores/workflow-store";
import BoltIcon from "@/public/assets/images/home/editor/workflow/bolt.svg";
import MailIcon from "@/public/assets/images/home/editor/workflow/mail.svg";
import RotateIcon from "@/public/assets/images/home/editor/workflow/rotate.svg";
import WebhookIcon from "@/public/assets/images/home/editor/workflow/webhook.svg";
import ProgressIcon from "@/public/assets/images/home/editor/workflow/progress.svg";
import HistoryIcon from "@/public/assets/images/home/editor/workflow/history.svg";
import GitBranchIcon from "@/public/assets/images/home/editor/workflow/git-branch.svg";
import UsersPlusIcon from "@/public/assets/images/home/editor/workflow/users-plus.svg";

export type ActionDefinition = {
  kind: ActionKind;
  label: string;
  accent: string;
  theme: string;
  Icon: AssetSvgComponent;
  title: string;
  description: string;
};

export const ACTIONS: Record<ActionKind, ActionDefinition> = {
  trigger: {
    kind: "trigger",
    label: "Trigger Action",
    accent: "#9875ff",
    theme: "[--accent-body:#272438] [--accent:#9875ff]",
    Icon: BoltIcon,
    title: "Signed Up",
    description: "Triggered when a new subscriber signs up for your newsletter",
  },
  "send-email": {
    kind: "send-email",
    label: "Send Email",
    accent: "#75caff",
    theme: "[--accent-body:#243038] [--accent:#75caff]",
    Icon: MailIcon,
    title: "Welcome to the hive",
    description: "Sends the welcome email with a link to your latest issue.",
  },
  "update-subscription": {
    kind: "update-subscription",
    label: "Update Subscription",
    accent: "#75ff77",
    theme: "[--accent-body:#243824] [--accent:#75ff77]",
    Icon: RotateIcon,
    title: "Add to Weekly Digest",
    description: "Moves the subscriber onto the weekly digest list.",
  },
  "send-webhook": {
    kind: "send-webhook",
    label: "Send Webhook",
    accent: "#ffb575",
    theme: "[--accent-body:#382d24] [--accent:#ffb575]",
    Icon: WebhookIcon,
    title: "POST to CRM",
    description: "Sends the subscriber's details to an external URL.",
  },
  "wait-until": {
    kind: "wait-until",
    label: "Wait Until",
    accent: "#ff75e3",
    theme: "[--accent-body:#382434] [--accent:#ff75e3]",
    Icon: ProgressIcon,
    title: "Monday at 9:00 AM",
    description: "Ensures the welcome email is sent at an optimal time.",
  },
  "time-delay": {
    kind: "time-delay",
    label: "Time Delay",
    accent: "#ff7575",
    theme: "[--accent-body:#382424] [--accent:#ff7575]",
    Icon: HistoryIcon,
    title: "Wait 2 days",
    description: "Pauses the workflow before the next step runs.",
  },
  branch: {
    kind: "branch",
    label: "True/False Branch",
    accent: "#75ffd3",
    theme: "[--accent-body:#243832] [--accent:#75ffd3]",
    Icon: GitBranchIcon,
    title: "Branch on 0 conditions",
    description: "Need to add a condition, e.g., Opened Email 1 = True",
  },
  enroll: {
    kind: "enroll",
    label: "Enroll in Automation",
    accent: "#75aaff",
    theme: "[--accent-body:#242c38] [--accent:#75aaff]",
    Icon: UsersPlusIcon,
    title: "Re-engagement series",
    description: "Hands the subscriber over to another automation.",
  },
};

export const ACTION_GROUPS: { label: string; kinds: ActionKind[] }[] = [
  { label: "Messages", kinds: ["send-email"] },
  { label: "Data", kinds: ["update-subscription", "send-webhook"] },
  { label: "Delays", kinds: ["wait-until", "time-delay"] },
  { label: "Flow control", kinds: ["branch", "enroll"] },
];
