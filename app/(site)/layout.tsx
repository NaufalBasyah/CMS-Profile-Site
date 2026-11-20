import { Suspense } from "react";
import { FooterFallback, SiteFooter } from "@/components/site/footer";
import { CurrentSiteHeader, SiteHeader } from "@/components/site/header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Suspense fallback={<SiteHeader path="" />}>
        <CurrentSiteHeader />
      </Suspense>
      <main id="main" className="flex-1">
        {children}
      </main>
      <Suspense fallback={<FooterFallback />}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
