"use client"

import * as SwitchPrimitive from "@radix-ui/react-switch"
import * as React from "react"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15 rem] w-8 shrink-0 items-center rounded-full border border-transparent bg-input shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-[calc(100%-2px)]",
          "data-[state=unchecked]:bg-neutral-300",
          "data-[state=unchecked]:bg-neutral-600", // Gray circle when unchecked
          "data-[state=checked]:bg-green-500" // Green circle when checked
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch }
