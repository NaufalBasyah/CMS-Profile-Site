import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Cta, PageFallback, PageHero, Section, SectionHead } from "@/components/site/blocks";
import { getClients } from "@/lib/content";

export const metadata: Metadata = {
  title: "Markets and customers",
  description: "We supply leading resin and chemical producers across Asia.",
};

const REGIONS = [
  ["China", "Our largest market, served from Medan by sea."],
  ["South Korea and Taiwan", "Long-standing customers in styrenics, PVC and petrochemicals."],
  ["Japan and Southeast Asia", "Engineering plastics, compounding and lubricant producers."],
];

export default function MarketsPage() {
  return (
    <>
      <PageHero title="Markets and customers">
        <p>
          China, Taiwan and South Korea are our major markets. We supply leading chemical companies across Asia through
          long-standing relationships.
        </p>
      </PageHero>
      <Section>
        <h2 className="text-4xl sm:text-5xl">Where HI-LUB goes</h2>
        <ul className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-3">
          {REGIONS.map(([name, text]) => (
            <li key={name} className="border-t-2 border-primary pt-4">
              <strong className="block font-display text-2xl text-heading">{name}</strong>
              <span className="mt-1 block text-muted-foreground">{text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-muted-foreground">
          Share of sales by country is on the{" "}
          <Link href="/performance?tab=markets" className="font-semibold">Performance page</Link>.
        </p>
      </Section>
      <Suspense fallback={<PageFallback />}>
        <Clients />
      </Suspense>
      <Cta />
    </>
  );
}

async function Clients() {
  await connection();
  const clients = await getClients();
  return (
    <Section tone="mist">
      <SectionHead title="Main customers">Global chemical companies we have supplied over the long term.</SectionHead>
      <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <li key={c.id} className="border-t py-4">
            <strong className="block font-display text-xl text-heading">{c.name}</strong>
            <span className="text-muted-foreground">
              {c.country}
              {c.sector && `, ${c.sector}`}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
