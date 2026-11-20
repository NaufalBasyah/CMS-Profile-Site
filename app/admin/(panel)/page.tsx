import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { PageHead } from "@/components/admin/page-head";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_DEFS, type SectionKey } from "@/lib/admin/fields";
import { SECTION_TABLES } from "@/lib/admin/sections";
import { verifyPassword } from "@/lib/auth/password";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema as t } from "@/lib/db";

// Signed-in, per-request page: allowed to block instead of streaming a placeholder.
export const instant = false;

export default async function Dashboard() {
  const user = await requireUser();
  const db = await getDb();
  const keys = Object.keys(SECTION_DEFS) as SectionKey[];
  const [counts, [{ n: fresh }], recent, [me]] = await Promise.all([
    Promise.all(keys.map(async (k) => [k, (await db.select({ n: count() }).from(SECTION_TABLES[k].table))[0].n] as const)),
    db.select({ n: count() }).from(t.inquiries).where(eq(t.inquiries.status, "New")),
    db.select().from(t.inquiries).orderBy(desc(t.inquiries.createdAt)).limit(5),
    db.select().from(t.users).where(eq(t.users.username, user)).limit(1),
  ]);
  const defaultPassword = me && verifyPassword("change-me-now", me.passwordHash);

  return (
    <>
      <PageHead title={`Welcome, ${user}`}>Edit the website&apos;s content and read inquiries.</PageHead>
      {defaultPassword && (
        <p role="alert" className="mb-6 rounded-md border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          You are still using the default password. <Link href="/admin/account" className="font-semibold">Change it now</Link>.
        </p>
      )}
      <Card className="mb-8">
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-3xl text-heading">{fresh} new {fresh === 1 ? "inquiry" : "inquiries"}</p>
            <p className="text-sm text-muted-foreground">From the partnership form on the website.</p>
          </div>
          <Link href="/admin/inquiries" className="font-semibold">Open inquiries</Link>
        </CardContent>
        {recent.length > 0 && (
          <ul className="divide-y border-t">
            {recent.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/inquiries/${r.id}`} className="flex items-center justify-between gap-4 px-6 py-3 text-sm no-underline hover:bg-muted/50">
                  <span><b className="text-heading">{r.company}</b> <span className="block text-muted-foreground sm:inline sm:pl-2">{r.name}{r.interest && `, ${r.interest}`}</span></span>
                  {r.status === "New" && <Badge variant="warning">New</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {(["Content", "Performance"] as const).map((group) => (
        <section key={group} className="mb-8">
          <h2 className="mb-3 text-2xl">{group === "Performance" ? "Performance page figures" : "Content"}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {counts.filter(([k]) => SECTION_DEFS[k].group === group).map(([k, n]) => (
              <li key={k}>
                <Link href={`/admin/${k}`} className="flex items-center justify-between rounded-lg border bg-card px-5 py-4 no-underline hover:border-primary">
                  <span className="font-semibold text-heading">{SECTION_DEFS[k].label}</span>
                  <span className="text-sm text-muted-foreground">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
