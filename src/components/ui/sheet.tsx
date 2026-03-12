"use client"

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;

const SheetPortal = ({ children }: { children: React.ReactNode }) => (
  <Dialog.Portal>{children}</Dialog.Portal>
);

const SheetOverlay = forwardRef<
  ElementRef<typeof Dialog.Overlay>,
  ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
    {...props}
  />
));

const SheetContent = forwardRef<
  ElementRef<typeof Dialog.Content>,
  ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <Dialog.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[640px] rounded-t-3xl border border-[#e0e0e0] bg-white px-6 pb-6 pt-6 shadow-2xl transition-transform duration-200",
        className
      )}
      {...props}
    >
      {children}
    </Dialog.Content>
  </SheetPortal>
));

const SheetHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center justify-between", className)} {...props} />
);

const SheetFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
      className
    )}
    {...props}
  />
);

const SheetTitle = forwardRef<
  ElementRef<typeof Dialog.Title>,
  ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn("text-xl font-semibold text-[#222222]", className)}
    {...props}
  />
));

const SheetClose = forwardRef<
  ElementRef<typeof Dialog.Close>,
  ComponentPropsWithoutRef<typeof Dialog.Close>
>(({ className, children, ...props }, ref) => (
  <Dialog.Close
    ref={ref}
    className={cn(
      "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e0e0e0] bg-white text-[#555555] shadow-sm transition hover:border-[#FF5A5F] hover:text-[#FF5A5F]",
      className
    )}
    {...props}
  >
    {children ?? <X size={18} />}
  </Dialog.Close>
));

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetClose,
};
