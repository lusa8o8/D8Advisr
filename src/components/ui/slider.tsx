"use client"

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";

type SliderProps = ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  value: number[];
};

const Slider = forwardRef<ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, value, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-[6px] w-full grow rounded-full bg-[#e5e5e5]">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-[#FF5A5F]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-white bg-white shadow-md transition hover:bg-[#FF5A5F]" />
    </SliderPrimitive.Root>
  )
);

export { Slider };
