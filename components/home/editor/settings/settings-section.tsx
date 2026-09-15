import type { ReactNode } from "react";
import Divider from "@/components/_ui/divider";
import IconBadge from "@/components/_ui/icon-badge";
import { cn } from "@/lib/utils";

type SettingsSectionProps = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
  tone?: "default" | "danger";
  children: ReactNode;
};

export default function SettingsSection({
  id,
  title,
  description,
  icon,
  action,
  tone = "default",
  children,
}: SettingsSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative scroll-mt-6 overflow-clip rounded-[16px] bg-[#141417] shadow-[0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.12)]"
    >
      <div
        className={cn(
          "flex items-center justify-between gap-4 bg-[#18181c] px-[18px] py-3.5",
          tone === "danger" &&
            "bg-[linear-gradient(90deg,rgb(227_62_49/0.08),transparent_60%),linear-gradient(#18181c,#18181c)]",
        )}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <IconBadge>{icon}</IconBadge>
          <div className="flex min-w-0 flex-col">
            <span
              id={`${id}-title`}
              className="text-[16px] leading-6 font-[550] text-white text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]"
            >
              {title}
            </span>
            <span className="truncate text-[13px] leading-5 font-normal text-white/50">
              {description}
            </span>
          </div>
        </div>
        {action}
      </div>
      <Divider />
      <div className="flex flex-col gap-5 p-5">{children}</div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]" />
    </section>
  );
}

type SettingsRowProps = {
  title: string;
  description: string;
  children: ReactNode;
  htmlFor?: string;
};

export function SettingsRow({
  title,
  description,
  children,
  htmlFor,
}: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-[12px] bg-white/2 px-4 py-3 shadow-[0_0_0_1px_rgb(0_0_0/0.12),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
      <label htmlFor={htmlFor} className="flex min-w-0 cursor-pointer flex-col">
        <span className="text-[14px] leading-5 font-[550] text-white">
          {title}
        </span>
        <span className="text-[13px] leading-5 font-normal text-white/50">
          {description}
        </span>
      </label>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}
