import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container, Cta, MAIN_ACTION, PageFallback, Section, SectionHead, TextLink } from "@/components/site/blocks";
import { buttonVariants } from "@/components/ui/button";
import { getAdvantages, getClients, getNews, getProducts, getSettings } from "@/lib/content";
import { cn, longDate } from "@/lib/utils";

export default function HomePage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Home />
    </Suspense>
  );
}

// A real sequence, so the steps keep their numbers.
const CHAIN = [
  ["Fresh fruit bunches", "Harvested on North Sumatra plantations by local growers."],
  ["Crude palm oil", "Pressed and refined at oil palm mills nearby."],
  ["Stearic acid", "Fractionated by Indonesian oleochemical producers: our raw material."],
  ["Amidation", "Reacted with ethylenediamine in the Korean-built reactors at our Medan plant."],
  ["HI-LUB E.B.S.", "Beads and powders shipped to resin producers across Asia."],
];

async function Home() {
  await connection();
  const [s, products, advantages, clients, news] = await Promise.all([
    getSettings(), getProducts(), getAdvantages(), getClients(), getNews(3),
  ]);

  return (
    <>
      {/* Hero: a flat brand ground and the plant photo; the text entrance is the page's one moment */}
      <section className="bg-indigo-deep text-white">
        <Container className="grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-24">
          <div className="hero-enter">
            <h1 className="text-5xl text-white sm:text-6xl lg:text-7xl">{s.hero_title}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">{s.hero_intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={MAIN_ACTION.href} className={cn(buttonVariants({ variant: "light", size: "lg" }), "no-underline")}>
                {MAIN_ACTION.label}
              </Link>
              <Link href="/products" className={cn(buttonVariants({ variant: "outline-light", size: "lg" }), "no-underline")}>
                View HI-LUB grades
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/15 shadow-2xl shadow-black/30">
            <Image
              src="/img/factory.jpg"
              alt={`The CMS Chemical plant in ${s.location}, with a delivery truck at the gate`}
              width={1287}
              height={484}
              priority
              sizes="(min-width: 1024px) 540px, 100vw"
              className="aspect-[16/9] h-auto w-full object-cover object-[30%_50%] lg:aspect-[4/3]"
            />
          </div>
        </Container>
      </section>

      {/* Value chain */}
      <Section labelledBy="chain-title">
        <div className="mb-10 grid gap-6 lg:grid-cols-2 lg:items-end">
          <h2 id="chain-title" className="text-4xl sm:text-5xl">From palm fruit to polymer additive</h2>
          <p className="text-muted-foreground">
            <b className="font-semibold text-heading">
              2 C<sub>17</sub>H<sub>35</sub>COOH + C<sub>2</sub>H<sub>4</sub>(NH<sub>2</sub>)<sub>2</sub> → C<sub>38</sub>H
              <sub>76</sub>N<sub>2</sub>O<sub>2</sub> + 2 H<sub>2</sub>O
            </b>
            <br />
            Two molecules of stearic acid react with one of ethylenediamine to form E.B.S. and water.
          </p>
        </div>
        <ol className="grid gap-0 lg:grid-cols-5 lg:gap-6">
          {CHAIN.map(([title, text], i) => (
            <li
              key={title}
              className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-t py-4 lg:block lg:border-t-2 lg:border-primary lg:py-0 lg:pt-5"
            >
              <span className="font-display text-2xl text-palm tabular-nums lg:block">{i + 1}</span>
              <span>
                <strong className="block font-display text-xl text-heading lg:mt-2">{title}</strong>
                <span className="mt-1 block text-[0.95rem] text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Grades, as a list rather than a grid of identical boxes */}
      <Section tone="mist">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="text-4xl sm:text-5xl">HI-LUB grades</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {products.length === 4 ? "Four grades" : `${products.length} grades`}, in beads and powders. HI-LUB works as
              an internal and external lubricant, release agent and pigment dispersant in most thermoplastics.
            </p>
            <TextLink href="/products" className="mt-4">Full specifications and applications</TextLink>
          </div>
          <dl className="divide-y border-y">
            {products.map((p) => (
              <div key={p.id} className="grid gap-1 py-5 sm:grid-cols-[13rem_1fr] sm:gap-6">
                <dt>
                  <strong className="block font-display text-2xl text-heading">{p.name}</strong>
                  <span className="text-sm text-muted-foreground">{p.physicalForm}, {p.particleSize.toLowerCase()}</span>
                </dt>
                <dd className="text-[0.95rem] sm:pt-1">{p.bestFor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* Advantages */}
      <Section>
        <SectionHead title="Why buy E.B.S. from Medan" action={{ href: "/operations", label: "How we make HI-LUB" }} />
        <ul className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {advantages.map((a) => (
            <li key={a.id} className="border-t-2 border-primary pt-5">
              <h3 className="text-2xl">{a.title}</h3>
              <p className="mt-2 text-muted-foreground">{a.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Customers: a plain list of names, no boxes */}
      <Section tone="mist">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="text-4xl sm:text-5xl">Customers across Asia</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Long-standing supply to resin and chemical producers, most of them in China, Taiwan and South Korea. Share
              of sales by country is on the <Link href="/performance?tab=markets" className="font-semibold">Performance page</Link>.
            </p>
            <TextLink href="/markets" className="mt-4">All customers and markets</TextLink>
          </div>
          <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {clients.slice(0, 9).map((c) => (
              <li key={c.id} className="border-t py-3">
                <strong className="block font-display text-lg text-heading">{c.name}</strong>
                <span className="text-sm text-muted-foreground">{c.country}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {news.length > 0 && (
        <Section>
          <SectionHead title="Latest news" action={{ href: "/news", label: "All news" }} />
          <ul className="divide-y border-y">
            {news.map((n) => (
              <li key={n.slug} className="grid gap-2 py-6 md:grid-cols-[12rem_1fr] md:gap-8">
                <p className="text-sm text-muted-foreground">
                  <time dateTime={n.publishedOn}>{longDate(n.publishedOn)}</time>
                  <span className="mt-0.5 block font-semibold text-palm">{n.category}</span>
                </p>
                <div>
                  <h3 className="text-2xl">
                    <Link href={`/news/${n.slug}`} className="text-heading no-underline hover:text-primary hover:underline">
                      {n.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-muted-foreground">{n.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Cta />
    </>
  );
}
