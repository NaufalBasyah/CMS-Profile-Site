import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminMobileNav, AdminSidebar, CurrentAdminSidebar } from "@/components/admin/nav";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/admin/actions";

// The admin panel is always signed-in, per-request data: let its pages block rather than stream.
export const instant = false;

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh bg-mist/60">
      <Suspense fallback={<AdminSidebar path="" />}>
        <CurrentAdminSidebar />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b bg-white px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Suspense>
              <AdminMobileNav />
            </Suspense>
            <span className="font-display text-lg text-heading lg:hidden">CMS Chem admin</span>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">Sign out</Button>
          </form>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
