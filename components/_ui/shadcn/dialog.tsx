"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(
  props: React.ComponentProps<typeof DialogPrimitive.Close>,
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

const contentVariants = {
  modal:
    "top-1/2 left-1/2 max-h-[calc(100dvh-64px)] w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] shadow-[0_32px_64px_rgb(0_0_0/0.44),0_12px_24px_rgb(0_0_0/0.24),0_0_0_1px_rgb(0_0_0/0.32),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)] duration-200 data-[state=closed]:zoom-out-[0.97] data-[state=closed]:duration-150 data-[state=open]:zoom-in-[0.97] motion-reduce:data-[state=open]:zoom-in-100",
  sheet:
    "inset-x-0 bottom-0 max-h-[85dvh] w-full rounded-t-[20px] shadow-[0_-24px_48px_rgb(0_0_0/0.4),0_0_0_1px_rgb(0_0_0/0.32),inset_0_1px_0_rgb(255_255_255/0.06)] duration-300 data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-200 data-[state=open]:slide-in-from-bottom",
};

function DialogContent({
  className,
  children,
  variant = "modal",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  variant?: keyof typeof contentVariants;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="ease-power3-out data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/55 backdrop-blur-[3px] duration-200" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "ease-power3-out data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed z-50 flex flex-col overflow-clip bg-[#141417] text-white outline-none",
          contentVariants[variant],
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-[16px] leading-6 font-[550] text-white text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-[13px] leading-5 text-white/50", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
