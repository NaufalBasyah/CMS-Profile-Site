import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { InView } from "@/components/motion/in-view";
import { Cta, PageFallback, PageHero, Section } from "@/components/site/blocks";
import { getCertifications, getMilestones, getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "About us",
  description: "A 1999 joint venture of Choyang Fine Chemical, PT. Mopoli Raya and Samsung Corporation, making E.B.S. in Medan.",
};

export default function AboutPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <About />
    </Suspense>
  );
}

const PARTNERS = [
  ["C", "Choyang Fine Chemical", "Korea. E.B.S. process technology."],
  ["M", "PT. Mopoli Raya", "Indonesia. Local operations and palm supply."],
  ["S", "Samsung Corporation", "Korea. Global trading network."],
];

async function About() {
  await connection();
  const [s, milestones, certifications] = await Promise.all([getSettings(), getMilestones(), getCertifications()]);
  return (
    <>
      <PageHero title="About us" eyebrow="Joint venture since 1999">
        <p>{s.about_intro}</p>
      </PageHero>

      <Section>
        <ul className="grid gap-4 md:grid-cols-3">
          {PARTNERS.map(([letter, name, text]) => (
            <li key={name} className="flex gap-4 rounded-lg border bg-card p-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary font-display text-2xl text-white">
                {letter}
              </span>
              <span>
                <strong className="block font-display text-xl text-heading">{name}</strong>
                <span className="text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl sm:text-5xl">Our facility</h2>
            <p className="mt-4 text-lg">{s.facility_text}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="border-t-2 border-palm pt-4">
              <h3 className="text-2xl">Vision</h3>
              <p className="mt-2 text-muted-foreground">{s.vision}</p>
            </div>
            <div className="border-t-2 border-palm pt-4">
              <h3 className="text-2xl">Mission</h3>
              <p className="mt-2 text-muted-foreground">{s.mission}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-4xl sm:text-5xl">Our history</h2>
            <p className="mt-3 text-muted-foreground">Key moments since the joint venture was formed.</p>
          </div>
          <ol className="relative border-l-2 border-primary/25 pl-8">
            {milestones.map((m) => (
              <InView as="li" key={m.id} className="relative pb-10 last:pb-0">
                <span className="absolute top-1.5 -left-[2.4rem] size-3.5 rounded-full border-2 border-primary bg-mist" />
                <p className="font-display text-xl text-primary">{m.year}</p>
                <h3 className="mt-1 text-2xl">{m.title}</h3>
                <p className="mt-1 text-muted-foreground">{m.description}</p>
              </InView>
            ))}
          </ol>
        </div>
      </Section>

      {certifications.length > 0 && (
        <Section>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="text-4xl sm:text-5xl">Certifications</h2>
              <p className="mt-3 text-muted-foreground">Copies of certificates are available to customers on request.</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {certifications.map((c) => (
                <li key={c.id} className="rounded-lg border bg-card p-5">
                  <strong className="block font-display text-xl text-heading">{c.name}</strong>
                  <span className="mt-1 block text-muted-foreground">{c.scope}</span>
                  {c.since && <span className="mt-3 block text-sm font-semibold text-palm">Since {c.since}</span>}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}
      <Cta />
    </>
  );
}
