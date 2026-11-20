import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageFallback, PageHero, Section } from "@/components/site/blocks";
import { getNews } from "@/lib/content";
import { longDate } from "@/lib/utils";

export const metadata: Metadata = { title: "News", description: "Company announcements, product updates and events." };

export default function NewsPage() {
  return (
    <>
      <PageHero title="News">
        <p>Company announcements, product updates and events.</p>
      </PageHero>
      <Suspense fallback={<PageFallback />}>
        <NewsList />
      </Suspense>
    </>
  );
}

async function NewsList() {
  await connection();
  const posts = await getNews();
  return (
    <Section>
      {posts.length === 0 ? (
        <p>No news has been published yet.</p>
      ) : (
        <ul className="divide-y border-y">
          {posts.map((n) => (
            <li key={n.slug} className="grid gap-2 py-8 md:grid-cols-[12rem_1fr] md:gap-8">
              <p className="text-sm text-muted-foreground">
                <time dateTime={n.publishedOn}>{longDate(n.publishedOn)}</time>
                <br />
                <span className="font-semibold text-palm">{n.category}</span>
              </p>
              <div>
                <h2 className="text-3xl">
                  <Link href={`/news/${n.slug}`} className="text-heading no-underline hover:text-primary">
                    {n.title}
                  </Link>
                </h2>
                <p className="mt-2 text-muted-foreground">{n.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
