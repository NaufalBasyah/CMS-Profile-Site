import { InfoIcon } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PerformanceTabs, type PerformanceData } from "@/components/performance/performance-tabs";
import { Cta, PageFallback, PageHero, Section } from "@/components/site/blocks";
import { getPerformance, getSettings } from "@/lib/content";
import { MONTHS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Performance",
  description: "Production, sales and markets: annual figures, the current period by month, and share of sales by country.",
};

/** The only page on the site that shows production, sales or revenue figures. */
export default function PerformancePage({ searchParams }: PageProps<"/performance">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Performance searchParams={searchParams} />
    </Suspense>
  );
}

async function Performance({ searchParams }: { searchParams: PageProps<"/performance">["searchParams"] }) {
  await connection();
  const [s, { yearly, monthly, markets }, sp] = await Promise.all([getSettings(), getPerformance(), searchParams]);

  const years = [...new Set(monthly.map((m) => m.year))].sort().map(String);
  const byMonth = (key: "productionTons" | "salesTons") =>
    MONTHS.map((month, i) => ({
      month,
      ...Object.fromEntries(years.map((y) => [y, monthly.find((m) => String(m.year) === y && m.month === i + 1)?.[key] ?? null])),
    }));

  const data: PerformanceData = {
    annual: yearly.map((y) => ({ year: y.year, production: y.productionTons, sales: y.salesTons, revenue: y.salesUsd })),
    monthly: byMonth("productionTons"),
    monthlySales: byMonth("salesTons"),
    monthlyYears: years,
    totals: years.map((y) => {
      const rows = monthly.filter((m) => String(m.year) === y);
      return {
        year: y,
        months: rows.length,
        production: rows.reduce((a, r) => a + r.productionTons, 0),
        sales: rows.reduce((a, r) => a + r.salesTons, 0),
        revenue: rows.reduce((a, r) => a + r.salesUsd, 0),
      };
    }),
    markets: markets.map((m) => ({ country: m.country, share: m.sharePct, note: m.note })),
    capacity: s.capacity_tons,
  };
  const first = yearly[0]?.year;
  const last = yearly.at(-1)?.year;

  return (
    <>
      <PageHero title="Performance and growth" eyebrow={first && last ? `${first}–${last} and this year` : "Figures"}>
        <p>{s.performance_intro}</p>
      </PageHero>
      <Section className="pt-10 sm:pt-12 lg:pt-14">
        {s.show_figures_notice === "1" && (
          <p className="mb-8 flex gap-3 rounded-lg border border-oxide/25 bg-oxide/5 px-4 py-3 text-sm text-heading">
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-oxide" />
            <span>
              <b>Illustrative figures.</b> The numbers on this page are sample data for demonstration and are not the
              company&apos;s reported results.
            </span>
          </p>
        )}
        <PerformanceTabs data={data} initialTab={typeof sp.tab === "string" ? sp.tab : "annual"} />
      </Section>
      <Cta />
    </>
  );
}
