import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Cta, PageFallback, PageHero, Section, SectionHead } from "@/components/site/blocks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApplications, getProducts } from "@/lib/content";
import type { Product } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "HI-LUB products",
  description: "HI-LUB ethylene bis stearamide grades B50, B80, P130 and P200: specifications, packing and applications.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero title="HI-LUB ethylene bis stearamide grades">
        <p>
          A palm-based wax amide that lubricates, releases and disperses in thermoplastics without affecting their
          chemical stability or surface appearance.
        </p>
      </PageHero>
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl">What HI-LUB is</h2>
            <p className="mt-4">
              HI-LUB is ethylene bis stearamide (E.B.S.), made by reacting stearic acid with ethylenediamine. It is
              insoluble in water, alcohol, aliphatics and aromatics at room temperature, so it can be added to
              thermoplastics without reducing their chemical stability.
            </p>
            <p className="mt-4">
              It has excellent heat stability and practically no moisture or ash. Its high melting point makes it a
              standard choice for forming lubricating films that hold up through demanding processing.
            </p>
          </div>
          <div>
            <h2 className="text-4xl">How it works</h2>
            <p className="mt-4">
              HI-LUB acts as both an internal and a surface lubricant. Inside the resin it lowers the power needed for
              mixing and extrusion and improves flow through dies and into moulds. It also disperses pigment, for faster
              blending and more even colour.
            </p>
            <p className="mt-4">
              Milled into ABS or rigid PVC, it gives excellent lubricity without spoiling the finished part. Its limited
              compatibility with polystyrene, ABS, polyethylene, PVC, nylon, cellulose acetate and polyvinyl acetate is
              what makes it work well as a lubricant.
            </p>
          </div>
        </div>
      </Section>
      <Suspense fallback={<PageFallback />}>
        <Grades />
      </Suspense>
      <Cta />
    </>
  );
}

const ROWS: [string, keyof Product][] = [
  ["Grade", "grade"], ["Physical form", "physicalForm"], ["Particle size", "particleSize"],
  ["Acid value", "acidValue"], ["Amine value", "amineValue"], ["Melting point", "meltingPoint"],
  ["Colour", "color"], ["Packing", "packing"], ["Best for", "bestFor"],
];

async function Grades() {
  await connection();
  const [products, applications] = await Promise.all([getProducts(), getApplications()]);
  return (
    <>
      <Section tone="mist" id="grades">
        <SectionHead
          title="Grades and specifications"
          action={{ href: "/partnership?interest=Technical%20data", label: "Request a technical data sheet" }}
        />
        {/* Tablet and up: one table to compare grades side by side */}
        <div className="hidden rounded-lg border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col">Property</TableHead>
                {products.map((p) => (
                  <TableHead scope="col" key={p.id} className="text-base font-display text-heading">
                    {p.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map(([label, key]) => (
                <TableRow key={key}>
                  <TableHead scope="row" className="h-auto py-3 align-top">{label}</TableHead>
                  {products.map((p) => (
                    <TableCell key={p.id} className="whitespace-pre-line">{String(p[key] || "—")}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Phones: one spec sheet per grade, read top to bottom */}
        <ul className="space-y-4 md:hidden">
          {products.map((p) => (
            <li key={p.id} className="rounded-lg border bg-card p-5">
              <h3 className="text-2xl">{p.name}</h3>
              <dl className="mt-3 divide-y text-[0.95rem]">
                {ROWS.filter(([, key]) => key !== "grade").map(([label, key]) => (
                  <div key={key} className="grid grid-cols-[7.5rem_1fr] gap-3 py-2">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="whitespace-pre-line">{String(p[key] || "—")}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">All descriptions and specifications are subject to change without notice.</p>
      </Section>
      <Section id="applications">
        <SectionHead title="Applications by industry">Where our customers use HI-LUB.</SectionHead>
        <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((a) => (
            <li key={a.id} className="border-t pt-4">
              <strong className="block font-display text-xl text-heading">{a.name}</strong>
              <span className="mt-1 block text-muted-foreground">{a.description}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10">
          Not sure which grade fits your process? <Link href="/partnership?interest=Sample" className="font-semibold">Send an inquiry for a sample</Link>.
        </p>
      </Section>
    </>
  );
}
