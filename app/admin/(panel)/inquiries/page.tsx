import { desc } from "drizzle-orm";
import Link from "next/link";
import { PageHead } from "@/components/admin/page-head";
import { StatusBadge } from "@/components/admin/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema as t } from "@/lib/db";

export const metadata = { title: "Inquiries" };

// Signed-in, per-request page: allowed to block instead of streaming a placeholder.
export const instant = false;

export default async function InquiriesPage() {
  await requireUser("/admin/inquiries");
  const db = await getDb();
  const rows = await db.select().from(t.inquiries).orderBy(desc(t.inquiries.createdAt));
  return (
    <>
      <PageHead title="Inquiries">Messages sent from the partnership form.</PageHead>
      {rows.length === 0 ? (
        <p className="rounded-lg border bg-card p-6 text-muted-foreground">No inquiries yet.</p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Received</TableHead><TableHead>Company</TableHead><TableHead>Name</TableHead>
                <TableHead>Interest</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">{r.createdAt.toISOString().slice(0, 10)}</TableCell>
                  <TableCell className="font-semibold"><Link href={`/admin/inquiries/${r.id}`}>{r.company}</Link></TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.interest}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
