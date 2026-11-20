"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-6", className)} {...props} />;
}

function TabsList({ className, children, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("relative z-0 inline-flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1", className)}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator className="absolute top-1/2 left-0 -z-10 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 rounded-md bg-white shadow-sm transition-[translate,width] duration-200 ease-out" />
    </TabsPrimitive.List>
  );
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        "flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-heading focus-visible:outline-2 focus-visible:outline-ring data-active:text-heading [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel data-slot="tabs-panel" className={cn("outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTab, TabsPanel };
