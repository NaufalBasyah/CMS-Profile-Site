"use client";

import { CalendarRangeIcon, GlobeIcon, TrendingUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { num, usd } from "@/lib/utils";
import type { AnnualPoint, MonthlyPoint } from "./charts";
import { LazyAnnualChart, LazyMonthlyChart } from "./lazy-charts";

export type PerformanceData = {
  annual: AnnualPoint[];
  monthly: MonthlyPoint[];
  monthlySales: MonthlyPoint[];
  monthlyYears: string[];
  totals: { year: string; production: number; sales: number; revenue: number; months: number }[];
  markets: { country: string; share: number; note: string }[];
  capacity: string;
};

const TABS = ["annual", "monthly", "markets"] as const;
type Tab = (typeof TABS)[number];

export function PerformanceTabs({ data, initialTab }: { data: PerformanceData; initialTab: string }) {
  const router = useRouter();
  const tab: Tab = (TABS as readonly string[]).includes(initialTab) ? (initialTab as Tab) : "annual";
  const latest = data.annual.at(-1);
  const top = Math.max(...data.markets.map((m) => m.share), 1);

  return (
    <Tabs
      defaultValue={tab}
      onValueChange={(v) => router.replace(v === "annual" ? "/performance" : `/performance?tab=${v}`, { scroll: false })}
    >
      <TabsList aria-label="Performance figures">
        <TabsTab value="annual"><TrendingUpIcon /> Annual</TabsTab>
        <TabsTab value="monthly"><CalendarRangeIcon /> Monthly</TabsTab>
        <TabsTab value="markets"><GlobeIcon /> Markets</TabsTab>
      </TabsList>

      <TabsPanel value="annual" className="space-y-8">
        {latest && (
          <dl className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label={`Produced in ${latest.year}`}>{num(latest.production)} t</Kpi>
            <Kpi label={`Sold in ${latest.year}`}>{num(latest.sales)} t</Kpi>
            <Kpi label={`Sales revenue in ${latest.year}`}>{usd(latest.revenue)}</Kpi>
            <Kpi label="Annual capacity">{data.capacity} t</Kpi>
          </dl>
        )}
        <figure className="rounded-lg border bg-card p-5 sm:p-6">
          <figcaption className="mb-4">
            <h2 className="text-2xl">Annual production and sales volume</h2>
            <p className="text-sm text-muted-foreground">Tons per year (bars) and sales revenue in US dollars (line).</p>
          </figcaption>
          <LazyAnnualChart data={data.annual} />
          <details className="mt-4 group">
            <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-primary">Show the figures as a table</summary>
            <div className="mt-3">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Year</TableHead><TableHead className="text-right">Production (t)</TableHead>
                    <TableHead className="text-right">Sales (t)</TableHead><TableHead className="text-right">Sales (US$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.annual.map((y) => (
                    <TableRow key={y.year}>
                      <TableCell>{y.year}</TableCell>
                      <TableCell className="text-right">{num(y.production)}</TableCell>
                      <TableCell className="text-right">{num(y.sales)}</TableCell>
                      <TableCell className="text-right">{num(y.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </details>
        </figure>
      </TabsPanel>

      <TabsPanel value="monthly" className="space-y-6">
        <dl className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
          {data.totals.map((t) => (
            <Kpi key={t.year} label={`${t.year}, ${t.months} month${t.months === 1 ? "" : "s"}: ${num(t.sales)} t sold, ${usd(t.revenue)}`}>
              {num(t.production)} t produced
            </Kpi>
          ))}
        </dl>
        <div className="grid gap-6 lg:grid-cols-2">
          <figure className="rounded-lg border bg-card p-5 sm:p-6">
            <figcaption className="mb-4">
              <h2 className="text-2xl">Production by month</h2>
              <p className="text-sm text-muted-foreground">Tons per month, compared by year.</p>
            </figcaption>
            <LazyMonthlyChart data={data.monthly} years={data.monthlyYears} />
          </figure>
          <figure className="rounded-lg border bg-card p-5 sm:p-6">
            <figcaption className="mb-4">
              <h2 className="text-2xl">Sales by month</h2>
              <p className="text-sm text-muted-foreground">Tons per month, compared by year.</p>
            </figcaption>
            <LazyMonthlyChart data={data.monthlySales} years={data.monthlyYears} />
          </figure>
        </div>
      </TabsPanel>

      <TabsPanel value="markets">
        <div className="grid gap-10 rounded-lg border bg-card p-5 sm:p-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="text-3xl">Where our sales go</h2>
            <p className="mt-2 text-muted-foreground">Approximate share of annual sales by country.</p>
          </div>
          <ul className="space-y-3">
            {data.markets.map((m) => (
              <li key={m.country} className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr_4rem]">
                <span className="font-medium text-heading">{m.country}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-mist" aria-hidden>
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${(m.share / top) * 100}%` }} />
                </span>
                <b className="text-right font-semibold text-heading">{num(m.share, m.share < 2 && m.share % 1 ? 1 : 0)}%</b>
              </li>
            ))}
          </ul>
        </div>
      </TabsPanel>
    </Tabs>
  );
}

function Kpi({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-1 bg-card p-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-display text-3xl text-heading sm:text-4xl">{children}</dd>
    </div>
  );
}
