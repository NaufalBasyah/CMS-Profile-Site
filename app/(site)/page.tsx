import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FlowLines } from "@/components/effects/flow-lines";
import { InView } from "@/components/motion/in-view";
import { Container, Cta, PageFallback, Section, SectionHead } from "@/components/site/blocks";
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

const CHAIN = [
  ["Fresh fruit bunches", "Harvested on North Sumatra plantations.", "Local growers"],
  ["Crude palm oil", "Pressed and refined at nearby oil palm mills.", "Local mills"],
  ["Stearic acid", "Fractionated by Indonesian oleochemical producers, third level from CPO.", "Our raw material"],
  ["Amidation", "Reacted with ethylenediamine in our Korean-built reactors.", "Our plant, Medan"],
  ["HI-LUB E.B.S.", "Beads and powders exported to resin producers across Asia.", "Our customers"],
];

async function Home() {
  await connection();
  const [s, products, advantages, clients, news] = await Promise.all([
    getSettings(), getProducts(), getAdvantages(), getClients(), getNews(3),
  ]);

  return (
    <>
      {/* Hero: the one animated effect on the page */}
      <section className="relative overflow-hidden bg-indigo-deep text-white">
        <FlowLines className="pointer-events-none absolute inset-0 h-full w-full opacity-70 [mask-image:linear-gradient(to_right,transparent_0%,black_45%)] lg:[mask-image:linear-gradient(to_right,rgba(0,0,0,0.25)_0%,black_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(46,42,143,0.65),transparent_60%)]" />
        <Container className="relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:py-28">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
              <span className="size-1.5 rounded-full bg-[#8fd1a6]" /> Medan · Since {s.founded}
            </p>
            <h1 className="text-5xl text-white sm:text-6xl lg:text-7xl">{s.hero_title}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">{s.hero_intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/products" className={cn(buttonVariants({ variant: "light", size: "lg" }), "no-underline")}>
                View HI-LUB grades
              </Link>
              <Link href="/partnership" className={cn(buttonVariants({ variant: "outline-light", size: "lg" }), "no-underline")}>
                Discuss a partnership
              </Link>
            </div>
          </div>
          <figure className="overflow-hidden rounded-lg border border-white/15 bg-white/5 shadow-2xl shadow-black/30">
            <Image
              src="/img/factory.jpg"
              alt="The CMS Chem factory entrance in Medan with a delivery truck at the gate"
              width={1287}
              height={484}
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              className="aspect-[4/3] h-auto w-full object-cover object-[30%_50%] sm:aspect-[16/9] lg:aspect-[4/3]"
            />
            <figcaption className="px-4 py-3 text-sm text-white/70">Our plant in {s.location}</figcaption>
          </figure>
        </Container>
      </section>

      {/* Value chain */}
      <Section labelledBy="chain-title">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
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
        <ol className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {CHAIN.map(([title, text, who], i) => (
            <InView as="li" key={title} delay={i * 0.06} className="flex flex-col gap-2 bg-card p-5">
              <span className="text-sm font-semibold text-palm tabular-nums">0{i + 1}</span>
              <strong className="font-display text-xl">{title}</strong>
              <span className="text-sm text-muted-foreground">{text}</span>
              <span className="mt-auto pt-3 text-xs font-semibold tracking-wide text-primary uppercase">{who}</span>
            </InView>
          ))}
        </ol>
      </Section>

      {/* Qualitative facts (figures live on the Performance page) */}
      <section className="border-y bg-white">
        <Container>
          <dl className="grid divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {[
              [s.founded, "First E.B.S. manufacturer in Indonesia"],
              [String(products.length), "HI-LUB grades, in beads and powders"],
              ["3 shifts", "A day, so we can hold lead times"],
              ["Asia-wide", "Customers in China, Taiwan, Korea, Japan and beyond"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse gap-1 px-2 py-7 lg:px-6">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="font-display text-4xl text-heading">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="border-t py-4 text-sm text-muted-foreground">
            Production, sales and market figures are on the{" "}
            <Link href="/performance" className="font-semibold">Performance page</Link>.
          </p>
        </Container>
      </section>

      {/* Grades */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-4xl sm:text-5xl">HI-LUB grades</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              HI-LUB is our brand of ethylene bis stearamide. It works as an internal and external lubricant, release
              agent and pigment dispersant in most thermoplastics.
            </p>
            <Link href="/products" className="mt-6 inline-flex items-center gap-1.5 font-semibold">
              Full specifications and applications <ArrowRightIcon className="size-4" />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {products.map((p, i) => (
              <InView as="li" key={p.id} delay={i * 0.05} className="rounded-lg border bg-card p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <strong className="font-display text-2xl">{p.name}</strong>
                  <span className="rounded-sm bg-mist px-2 py-0.5 text-xs font-semibold text-heading">{p.physicalForm}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.particleSize}</p>
                <p className="mt-3 text-[0.95rem]">{p.bestFor}</p>
              </InView>
            ))}
          </ul>
        </div>
      </Section>

      {/* Advantages */}
      <Section tone="mist">
        <SectionHead title="Why partners choose us" action={{ href: "/operations", label: "How we operate" }} />
        <ul className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {advantages.map((a, i) => (
            <InView as="li" key={a.id} delay={i * 0.05} className="border-t-2 border-primary pt-5">
              <h3 className="text-2xl">{a.title}</h3>
              <p className="mt-2 text-muted-foreground">{a.description}</p>
            </InView>
          ))}
        </ul>
      </Section>

      {/* Clients */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-4xl sm:text-5xl">Trusted by Asia&apos;s chemical majors</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We have built long relationships with leading resin and chemical producers, most of them in China, Taiwan
              and South Korea.
            </p>
            <Link href="/markets" className="mt-6 inline-flex items-center gap-1.5 font-semibold">
              Markets and customers <ArrowRightIcon className="size-4" />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
            {clients.slice(0, 9).map((c) => (
              <li key={c.id} className="bg-card p-4">
                <strong className="block font-display text-lg text-heading">{c.name}</strong>
                <span className="text-sm text-muted-foreground">{c.country}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {news.length > 0 && (
        <Section tone="mist">
          <SectionHead title="Latest news" action={{ href: "/news", label: "All news" }} />
          <ul className="grid gap-6 md:grid-cols-3">
            {news.map((n) => (
              <li key={n.slug} className="flex flex-col rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-palm">{n.category}</span> ·{" "}
                  <time dateTime={n.publishedOn}>{longDate(n.publishedOn)}</time>
                </p>
                <h3 className="mt-3 text-2xl">
                  <Link href={`/news/${n.slug}`} className="text-heading no-underline hover:text-primary">
                    {n.title}
                  </Link>
                </h3>
                <p className="mt-2 text-muted-foreground">{n.summary}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Cta />
    </>
  );
}
