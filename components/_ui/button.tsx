import Link from "next/link";
import { clsx } from "clsx";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

const surfaceShadow =
  "shadow-[0_2px_4px_-1px_rgb(0_0_0/0.08),0_1px_1px_-1px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]";

const raisedShadow =
  "shadow-[0_4px_8px_rgb(0_0_0/0.08),0_2px_4px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.16),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]";

export const buttonVariants = cva(
  "group inline-flex cursor-pointer items-center justify-center whitespace-nowrap outline-none select-none focus-visible:ring-2 focus-visible:ring-[#7f59f0]/60 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "rounded-full border border-[#202020] bg-[#202020] leading-[140%] font-bold text-white transition-[scale] active:scale-98",
        secondary:
          "rounded-full border-2 border-[#202020] leading-[140%] font-bold transition-[scale] active:scale-98",
        field: clsx(
          surfaceShadow,
          "ease-power3-in-out rounded-[8px] bg-[#1b1b20] font-medium text-white/80 transition-[background-color,color] duration-150 text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)] hover:bg-[#222228] hover:text-white active:bg-[#18181c]",
        ),
        accent:
          "ease-power3-in-out rounded-[8px] bg-[#5016ff] bg-[linear-gradient(0deg,rgb(255_255_255/0)_0%,rgb(255_255_255/0.1)_100%)] font-medium text-white shadow-[0_2px_6.5px_rgb(80_22_255/0.22),0_4px_4px_rgb(80_22_255/0.25),0_0_0_1px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)] transition-[background-color] duration-150 text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)] hover:bg-[#5b25ff] active:bg-[#4812e6]",
        ghost:
          "ease-power3-in-out rounded-[8px] transition-[background-color] duration-150 hover:bg-white/4 active:bg-white/6",
        raised: clsx(
          raisedShadow,
          "ease-power3-in-out rounded-[8px] border border-black bg-linear-to-t from-[#1b1b20] via-[#1b1b20] via-50% to-[#27272e] text-white transition-colors duration-150 hover:from-[#1f1f25] hover:via-[#1f1f25] hover:to-[#2d2d35] disabled:text-white/30",
        ),
        brick: clsx(
          raisedShadow,
          "ease-power3-in-out rounded-[10px] bg-[#1b1b20] text-white transition-colors duration-150 hover:bg-[#222228] active:bg-[#18181c] disabled:text-white/30",
        ),
        bare: "",
        crumb:
          "ease-power3-in-out rounded-[6px] font-normal text-[#fcfdff]/30 transition-colors duration-150 text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)] hover:text-white/70",
        round: clsx(
          raisedShadow,
          "ease-power3-in-out rounded-full border border-black bg-[#1b1b20] text-white transition-[background-color] duration-150 hover:bg-[#222228] active:bg-[#18181c]",
        ),
        nav: "ease-power3-in-out rounded-[10px] border border-transparent text-white/32 transition-[color] duration-150 hover:text-white/60 aria-[current=page]:border-black aria-[current=page]:bg-linear-to-l aria-[current=page]:from-[#1b1b20] aria-[current=page]:via-[#1b1b20] aria-[current=page]:via-50% aria-[current=page]:to-[#27272e] aria-[current=page]:text-white aria-[current=page]:shadow-[0_4px_8px_rgb(0_0_0/0.08),0_2px_4px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.16),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]",
        tab: "ease-power3-in-out relative rounded-[2px] bg-linear-to-t from-[#1b1b20] via-[#1b1b20] via-50% to-[#222229] font-medium text-[#989899] shadow-[0_2px_4px_-1px_rgb(0_0_0/0.5),inset_0_0.8px_0_#4b4c4d,inset_0_1px_1px_rgb(255_255_255/0.12),inset_0_-1px_0.5px_rgb(0_0_0/0.02),inset_0_0_1px_rgb(0_0_0/0.05),inset_0_1px_2px_-1px_rgb(255_255_255/0.1)] transition-[color] duration-300 text-shadow-[0_0.524px_1.048px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.24)] hover:text-[#c2c2c3]",
      },
      size: {
        sm: "px-2 py-1 text-[13px] sm:px-4 sm:py-2 sm:text-[14px]",
        md: "px-2 py-1 text-[14px] sm:px-4 sm:py-2 sm:text-base",
        lg: "px-2 py-1 text-[15px] sm:px-4 sm:py-2 sm:text-lg",
        xs: "h-6 px-2 text-[12px] leading-6",
        field: "h-8 gap-2 pr-2 pl-1.5 text-[14px] leading-6",
        block: "h-9 w-full gap-2 px-2 text-[14px] leading-6",
        crumb: "-mx-1 h-6 px-1 text-[14px] leading-6",
        bare: "",
        title:
          "h-6 max-w-full px-1.5 text-[14px] leading-6 font-[550] text-[#fcfdff]/90",
        icon: "size-8",
        "icon-lg": "size-9",
        tab: "px-4 py-1.5 text-[14px] leading-5 tracking-[-0.2596px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  },
);

type ButtonProps = VariantProps<typeof buttonVariants> &
  ComponentProps<"button"> & {
    href?: ComponentProps<typeof Link>["href"];
  };

export default function Button({
  variant,
  size,
  className,
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as Omit<ComponentProps<typeof Link>, "href" | "className">)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
