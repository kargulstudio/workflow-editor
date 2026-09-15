import Link from "next/link";
import { clsx } from "clsx";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

export const buttonVariants = cva(
  "rounded-full font-bold leading-[140%] whitespace-nowrap transition-all active:scale-98 cursor-pointer disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "border border-[#202020] bg-[#202020] text-white",
        secondary: "border-2 border-[#202020]",
      },
      size: {
        sm: "px-2 py-1 sm:px-4 sm:py-2 text-[13px] sm:text-[14px]",
        md: "px-2 py-1 sm:px-4 sm:py-2 text-[14px] sm:text-base",
        lg: "px-2 py-1 sm:px-4 sm:py-2 text-[15px] sm:text-lg",
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
  const classes = clsx(buttonVariants({ variant, size }), className);

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
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
