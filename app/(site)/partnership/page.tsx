import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageFallback, PageHero, Section } from "@/components/site/blocks";
import { getProducts, getSettings } from "@/lib/content";
import { InquiryForm } from "./inquiry-form";

export const metadata: Metadata = {
  title: "Send an inquiry",
  description: "Supply agreements, samples, technical data and new grade development. Send our sales team an inquiry.",
};

export default function PartnershipPage({ searchParams }: PageProps<"/partnership">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Partnership searchParams={searchParams} />
    </Suspense>
  );
}

async function Partnership({ searchParams }: { searchParams: PageProps<"/partnership">["searchParams"] }) {
  await connection();
  const [s, products, sp] = await Promise.all([getSettings(), getProducts(), searchParams]);
  const interest = typeof sp.interest === "string" ? sp.interest : "";
  const contact = [
    ["Address", s.address],
    ["Phone", s.phone],
    ["Email", s.email],
    ["Office hours", s.office_hours],
  ];
  return (
    <>
      <PageHero title="Supply, sample and partnership inquiries">
        <p>{s.partnership_intro}</p>
      </PageHero>
      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <h2 className="text-4xl">Sales office contact</h2>
            <dl className="mt-6 divide-y border-y">
              {contact.map(([k, val]) => (
                <div key={k} className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                  <dt className="font-semibold text-heading">{k}</dt>
                  <dd className="whitespace-pre-line">
                    {k === "Email" ? <a href={`mailto:${val}`}>{val}</a> : val}
                  </dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-10 text-2xl">What you can ask for</h3>
            <p className="mt-2 text-muted-foreground">
              Long-term supply agreements, spot orders, samples for qualification, technical data and safety data sheets,
              and joint development of new grades.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 sm:p-8">
            <h2 className="mb-6 text-4xl">Send an inquiry</h2>
            <InquiryForm grades={products.map((p) => p.name)} interest={interest} />
          </div>
        </div>
      </Section>
    </>
  );
}
