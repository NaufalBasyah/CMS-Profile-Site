import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Cta, PageFallback, PageHero, Section, SectionHead } from "@/components/site/blocks";
import { PhotoGallery } from "@/components/site/carousel";
import { getCertifications, getMilestones, getSettings } from "@/lib/content";
import { COMPANY_PHOTOS } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "About the joint venture",
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
  ["Choyang Fine Chemical", "Korea", "E.B.S. process technology"],
  ["PT. Mopoli Raya", "Indonesia", "local operations and palm supply"],
  ["Samsung Corporation", "Korea", "global trading network"],
];

async function About() {
  await connection();
  const [s, milestones, certifications] = await Promise.all([getSettings(), getMilestones(), getCertifications()]);
  return (
    <>
      <PageHero title="A Korean–Indonesian joint venture, making E.B.S. since 1999">
        <p>{s.about_intro}</p>
      </PageHero>

      <Section>
        <h2 className="text-4xl sm:text-5xl">The three partners</h2>
        <ul className="reveal-each mt-8 grid gap-x-10 gap-y-6 md:grid-cols-3">
          {PARTNERS.map(([name, country, role]) => (
            <li key={name} className="border-t-2 border-primary pt-4">
              <strong className="block font-display text-2xl text-heading">{name}</strong>
              <span className="mt-1 block text-muted-foreground">
                {country}: {role}
              </span>
            </li>
          ))}
        </ul>
        <div className="reveal mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl sm:text-5xl">The Medan plant</h2>
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

      <Section tone="mist" labelledBy="people-title">
        <SectionHead id="people-title" title="People and moments at CMS Chemical">
          The partners, the Medan team and the plant over the years.
        </SectionHead>
        <PhotoGallery photos={COMPANY_PHOTOS} label="Photos of the joint venture" className="reveal" />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-4xl sm:text-5xl">History since 1999</h2>
            <p className="mt-3 text-muted-foreground">Key moments since the joint venture was formed.</p>
          </div>
          <ol className="reveal-each relative border-l-2 border-primary/25 pl-8">
            {milestones.map((m) => (
              <li key={m.id} className="relative pb-10 last:pb-0">
                <span className="absolute top-1.5 -left-[2.4rem] size-3.5 rounded-full border-2 border-primary bg-background" />
                <p className="font-display text-xl text-primary">{m.year}</p>
                <h3 className="mt-1 text-2xl">{m.title}</h3>
                <p className="mt-1 text-muted-foreground">{m.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {certifications.length > 0 && (
        <Section tone="mist">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="text-4xl sm:text-5xl">Certifications</h2>
              <p className="mt-3 text-muted-foreground">Copies of certificates are available to customers on request.</p>
            </div>
            <dl className="reveal-each divide-y border-y">
              {certifications.map((c) => (
                <div key={c.id} className="grid gap-1 py-4 sm:grid-cols-[1fr_5rem] sm:gap-6">
                  <dt>
                    <strong className="block font-display text-xl text-heading">{c.name}</strong>
                    <span className="mt-0.5 block text-muted-foreground">{c.scope}</span>
                  </dt>
                  {c.since && <dd className="text-sm font-semibold text-palm sm:pt-1 sm:text-right">Since {c.since}</dd>}
                </div>
              ))}
            </dl>
          </div>
        </Section>
      )}
      <Cta />
    </>
  );
}
