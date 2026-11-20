"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { MAIN_ACTION } from "./blocks";
import { Brand } from "./brand";
import { NAV } from "./nav";

function isCurrent(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`);
}

/** Header with the current page highlighted. Reads the URL, so render it inside <Suspense>. */
export function CurrentSiteHeader() {
  return <SiteHeader path={usePathname()} />;
}

export function SiteHeader({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[4.5rem]">
        <Brand />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(path, item.href) ? "page" : undefined}
              className="relative flex min-h-11 items-center rounded-md px-3 text-[0.95rem] font-medium text-foreground no-underline transition-colors hover:text-primary aria-[current=page]:text-primary aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:-bottom-[0.6rem] aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link href={MAIN_ACTION.href} className={cn(buttonVariants(), "ml-3 no-underline")}>
            {MAIN_ACTION.label}
          </Link>
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-11 lg:hidden")}
            aria-label="Open menu"
          >
            <MenuIcon className="size-6" />
          </SheetTrigger>
          <SheetContent>
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="pt-1">
              <Brand />
            </div>
            <nav aria-label="Main" className="mt-4 flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  aria-current={isCurrent(path, item.href) ? "page" : undefined}
                  className="flex min-h-12 items-center border-b text-lg font-medium text-heading no-underline aria-[current=page]:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link href={MAIN_ACTION.href} onClick={close} className={cn(buttonVariants(), "mt-4 no-underline")}>
              {MAIN_ACTION.label}
            </Link>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
