import "server-only";
import { asc, desc, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { schema as t } from "@/lib/db";
import type { SectionKey } from "./fields";

type Mapping = { table: PgTable & { id: PgColumn }; order: SQL[] };

/** Which database table backs each admin section, and how its list is sorted. */
export const SECTION_TABLES: Record<SectionKey, Mapping> = {
  products: { table: t.products, order: [asc(t.products.sort), asc(t.products.id)] },
  applications: { table: t.applications, order: [asc(t.applications.sort), asc(t.applications.id)] },
  milestones: { table: t.milestones, order: [asc(t.milestones.sort), asc(t.milestones.id)] },
  advantages: { table: t.advantages, order: [asc(t.advantages.sort), asc(t.advantages.id)] },
  clients: { table: t.clients, order: [asc(t.clients.sort), asc(t.clients.id)] },
  certifications: { table: t.certifications, order: [asc(t.certifications.sort), asc(t.certifications.id)] },
  news: { table: t.news, order: [desc(t.news.publishedOn), desc(t.news.id)] },
  yearly: { table: t.yearlyStats, order: [asc(t.yearlyStats.year)] },
  monthly: { table: t.monthlyStats, order: [desc(t.monthlyStats.year), asc(t.monthlyStats.month)] },
  markets: { table: t.markets, order: [asc(t.markets.sort), asc(t.markets.id)] },
};
