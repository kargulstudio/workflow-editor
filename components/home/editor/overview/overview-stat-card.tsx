import Image from "next/image";
import IconBadge from "@/components/_ui/icon-badge";
import { cn } from "@/lib/utils";
import UserIcon from "@/public/assets/images/home/editor/overview/user.svg";
import MailIcon from "@/public/assets/images/home/editor/overview/mail.svg";
import ClickIcon from "@/public/assets/images/home/editor/overview/click.svg";
import CardGlow from "@/public/assets/images/home/editor/overview/card-glow.svg";
import type { Stat } from "./overview-data";

const ICONS = { user: UserIcon, mail: MailIcon, click: ClickIcon };

type OverviewStatCardProps = {
  stat: Stat;
  textureSrc: string;
};

export default function OverviewStatCard({
  stat,
  textureSrc,
}: OverviewStatCardProps) {
  const Icon = ICONS[stat.icon];

  return (
    <div className="group/stat relative flex min-h-[145px] min-w-0 flex-col overflow-clip rounded-[16px] bg-[#141417] shadow-[0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.12)]">
      <Image
        src={textureSrc}
        alt=""
        width={450}
        height={140}
        className="pointer-events-none absolute bottom-[67px] left-1/2 h-[140px] w-[450px] max-w-none -translate-x-1/2 -scale-y-100 opacity-4 mix-blend-screen blur-[1.5px]"
      />
      <CardGlow
        aria-hidden
        className="ease-power3-out pointer-events-none absolute top-[-84px] left-1/2 h-[181px] w-[519px] max-w-none -translate-x-1/2 -scale-y-100 opacity-0 transition-opacity duration-600 group-hover/stat:opacity-100"
      />
      <div className="relative flex flex-col gap-5 px-5 pt-[19px] pb-[18px]">
        <div className="flex items-center gap-3.5">
          <IconBadge>
            <Icon className="size-[22px] text-white" />
          </IconBadge>
          <span className="ease-power3-in-out text-[16px] leading-6 font-[550] text-white/60 transition-colors duration-400 text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)] group-hover/stat:text-white">
            {stat.label}
          </span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="flex min-w-0 items-end gap-2.5">
            <span className="font-display text-[40px] leading-12 font-medium tracking-[-0.2px] whitespace-nowrap text-white tabular-nums">
              {stat.value}
              {stat.unit && (
                <span className="text-[24px] leading-none text-white/50">
                  {stat.unit}
                </span>
              )}
            </span>
            <span className="truncate py-1 text-[14px] leading-6 font-medium text-white/50 text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]">
              {stat.from}
            </span>
          </div>
          <span className="shrink-0 py-1.5">
            <span
              className={cn(
                "flex h-5 min-w-14 items-center justify-center rounded-full px-2 text-[12px] leading-4 font-semibold tabular-nums",
                stat.negative
                  ? "bg-[#f05959]/20 text-[#f07070]"
                  : "bg-[#1fc16b]/20 text-[#1fc16b]",
              )}
            >
              {stat.change}
            </span>
          </span>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]" />
    </div>
  );
}
