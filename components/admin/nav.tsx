"use client";

import { ExternalLinkIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SECTION_DEFS } from "@/lib/admin/fields";
import { cn } from "@/lib/utils";

const groups = [
  { title: "Overview", links: [["/admin", "Dashboard"], ["/admin/inquiries", "Inquiries"], ["/admin/settings", "Site settings"]] },
  { title: "Content", links: Object.entries(SECTION_DEFS).filter(([, d]) => d.group === "Content").map(([k, d]) => [`/admin/${k}`, d.label]) },
  { title: "Performance page", links: Object.entries(SECTION_DEFS).filter(([, d]) => d.group === "Performance").map(([k, d]) => [`/admin/${k}`, d.label]) },
  { title: "You", links: [["/admin/account", "Change password"]] },
];

function Links({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin" className="space-y-6">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="mb-1.5 px-3 text-xs font-semibold tracking-wide text-white/50 uppercase">{g.title}</p>
          <ul>
            {g.links.map(([href, label]) => {
              const active = href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className="block rounded-md px-3 py-1.5 text-sm text-white/80 no-underline hover:bg-white/10 hover:text-white aria-[current=page]:bg-white/15 aria-[current=page]:font-semibold aria-[current=page]:text-white"
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <Link href="/" target="_blank" className="flex items-center gap-1.5 px-3 text-sm text-white/70 no-underline hover:text-white">
        View the website <ExternalLinkIcon className="size-3.5" />
      </Link>
    </nav>
  );
}

export function AdminSidebar({ path }: { path: string }) {
  return (
    <aside className="hidden w-60 shrink-0 bg-indigo-deep px-3 py-6 lg:block">
      <p className="mb-6 px-3 font-display text-xl text-white">CMS Chemical admin</p>
      <Links path={path} />
    </aside>
  );
}

export function CurrentAdminSidebar() {
  return <AdminSidebar path={usePathname()} />;
}

export function AdminMobileNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")} aria-label="Open admin menu">
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent className="bg-indigo-deep text-white [&>button]:text-white [&>button:hover]:bg-white/10">
        <SheetTitle className="font-display text-xl text-white">CMS Chemical admin</SheetTitle>
        <div className="overflow-y-auto">
          <Links path={path} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
