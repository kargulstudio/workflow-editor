"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer ease-power3-in-out inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-[#26262d] p-0.5 shadow-[inset_0_1px_2px_rgb(0_0_0/0.4),0_0_0_1px_rgb(0_0_0/0.24),0_1px_0_rgb(255_255_255/0.04)] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#7f59f0]/60 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#5016ff]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="ease-smooth-in-out pointer-events-none block size-4 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.32),inset_0_-1px_0_rgb(0_0_0/0.12)] transition-transform duration-200 data-[state=checked]:translate-x-4 motion-reduce:transition-none"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
