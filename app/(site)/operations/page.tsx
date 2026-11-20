import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Cta, Figure, PageFallback, PageHero, Section, SectionHead } from "@/components/site/blocks";
import { getAdvantages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Operations",
  description: "How we turn Indonesian palm-based stearic acid into HI-LUB E.B.S. for export.",
};

export default function OperationsPage() {
  return (
    <>
      <PageHero title="Scope of business" eyebrow="Operations">
        <p>
          We make one product family and make it well: E.B.S. from Indonesian palm-based stearic acid, exported to the
          world&apos;s major chemical companies.
        </p>
      </PageHero>
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl sm:text-5xl">How we work</h2>
            <p className="mt-4 text-lg">
              We buy stearic acid from major mills in Indonesia, convert it to E.B.S. through our in-house chemical
              reaction process, and export HI-LUB to global chemical companies.
            </p>
            <p className="mt-4 text-lg">
              Because the whole chain from plantation to stearic acid sits within North Sumatra, our raw material travels
              a short distance and supply stays steady.
            </p>
          </div>
          <Figure
            src="/img/business-scope.jpg"
            alt="Process diagram: plantation, oil palm mills, crude palm oil, refining to stearic acid, reaction at the CMS plant, HI-LUB export by ship"
            width={780}
            height={461}
            caption="Business scope: from plantation to export."
          />
        </div>
      </Section>
      <Section tone="mist">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl sm:text-5xl">Our raw material</h2>
            <p className="mt-4 text-lg">
              Our main raw material is stearic acid, an oleochemical product three steps downstream from crude palm oil.
              It is produced by refining and fractionating palm oil and palm kernel oil.
            </p>
          </div>
          <Figure
            src="/img/value-chain.jpg"
            alt="Palm oil value chain from fresh fruit bunches through CPO and PKO, refining and fractionation, to downstream oleochemicals"
            width={1038}
            height={614}
            caption="The palm oil value chain, upstream to downstream."
          />
        </div>
      </Section>
      <Suspense fallback={<PageFallback />}>
        <Advantages />
      </Suspense>
      <Cta />
    </>
  );
}

async function Advantages() {
  await connection();
  const advantages = await getAdvantages();
  return (
    <Section>
      <SectionHead title="Competitive advantages" />
      <ul className="grid gap-x-12 gap-y-10 md:grid-cols-2">
        {advantages.map((a) => (
          <li key={a.id} className="border-t-2 border-primary pt-5">
            <h3 className="text-2xl">{a.title}</h3>
            <p className="mt-2 text-muted-foreground">{a.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
