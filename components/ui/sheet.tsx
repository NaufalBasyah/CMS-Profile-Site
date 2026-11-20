"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetTitle = SheetPrimitive.Title;

function SheetContent({ className, children, ...props }: SheetPrimitive.Popup.Props) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop className="fixed inset-0 min-h-dvh bg-indigo-deep/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
      <SheetPrimitive.Popup
        className={cn(
          "fixed inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col gap-4 bg-background p-6 shadow-xl transition-transform duration-200 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          aria-label="Close menu"
          className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-md text-heading hover:bg-accent"
        >
          <XIcon className="size-5" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetTitle, SheetContent };
