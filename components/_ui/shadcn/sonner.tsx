"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-[356px] items-center gap-3 rounded-[12px] bg-[#17171c]/90 px-3.5 py-3 text-[14px] leading-5 font-medium text-white shadow-[0_24px_48px_rgb(0_0_0/0.24),0_10px_18px_rgb(0_0_0/0.16),0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.24),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)] backdrop-blur-[12px]",
          title: "font-[550] text-white",
          description: "mt-0.5 text-[13px] leading-5 font-normal text-white/50",
          icon: "text-[#9875ff] [&_svg]:size-4",
          success: "[&_[data-icon]]:text-[#59f089]",
          error: "[&_[data-icon]]:text-[#ff6b61]",
          actionButton:
            "ml-auto h-7 shrink-0 cursor-pointer rounded-[8px] bg-white/8 px-2.5 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-white/12",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
