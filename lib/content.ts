/**
 * Read-only content for the public site.
 *
 * Every getter is cached ("use cache") under the CONTENT tag. Saving anything in
 * the admin panel calls updateTag(CONTENT), so visitors see the change on their
 * next page load. Pages call these only after `await connection()`, so nothing
 * touches the database during `next build`.
 */
import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb, schema as t } from "./db";

export const CONTENT = "content";

function tag() {
  cacheLife("max");
  cacheTag(CONTENT);
}

export type Settings = Record<string, string>;

export async function getSettings(): Promise<Settings> {
  "use cache";
  tag();
  const db = await getDb();
  const rows = await db.select({ key: t.settings.key, value: t.settings.value }).from(t.settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getProducts(activeOnly = true) {
  "use cache";
  tag();
  const db = await getDb();
  return db
    .select()
    .from(t.products)
    .where(activeOnly ? eq(t.products.isActive, true) : undefined)
    .orderBy(asc(t.products.sort), asc(t.products.id));
}

export async function getApplications() {
  "use cache";
  tag();
  const db = await getDb();
  return db.select().from(t.applications).orderBy(asc(t.applications.sort), asc(t.applications.id));
}

export async function getMilestones() {
  "use cache";
  tag();
  const db = await getDb();
  return db.select().from(t.milestones).orderBy(asc(t.milestones.sort), asc(t.milestones.id));
}

export async function getAdvantages() {
  "use cache";
  tag();
  const db = await getDb();
  return db.select().from(t.advantages).orderBy(asc(t.advantages.sort), asc(t.advantages.id));
}

export async function getClients() {
  "use cache";
  tag();
  const db = await getDb();
  return db.select().from(t.clients).orderBy(asc(t.clients.sort), asc(t.clients.id));
}

export async function getCertifications() {
  "use cache";
  tag();
  const db = await getDb();
  return db.select().from(t.certifications).orderBy(asc(t.certifications.sort), asc(t.certifications.id));
}

export async function getNews(limit?: number) {
  "use cache";
  tag();
  const db = await getDb();
  const q = db
    .select({
      slug: t.news.slug, title: t.news.title, category: t.news.category,
      publishedOn: t.news.publishedOn, summary: t.news.summary,
    })
    .from(t.news)
    .where(eq(t.news.isPublished, true))
    .orderBy(desc(t.news.publishedOn), desc(t.news.id));
  return limit ? q.limit(limit) : q;
}

export async function getNewsPost(slug: string) {
  "use cache";
  tag();
  const db = await getDb();
  const [post] = await db
    .select()
    .from(t.news)
    .where(and(eq(t.news.slug, slug), eq(t.news.isPublished, true)))
    .limit(1);
  return post ?? null;
}

/** All figures for the Performance page. Nothing else on the site shows numbers. */
export async function getPerformance() {
  "use cache";
  tag();
  const db = await getDb();
  const [yearly, monthly, markets] = await Promise.all([
    db.select().from(t.yearlyStats).orderBy(asc(t.yearlyStats.year)),
    db.select().from(t.monthlyStats).orderBy(asc(t.monthlyStats.year), asc(t.monthlyStats.month)),
    db.select().from(t.markets).orderBy(asc(t.markets.sort), asc(t.markets.id)),
  ]);
  return { yearly, monthly, markets };
}
