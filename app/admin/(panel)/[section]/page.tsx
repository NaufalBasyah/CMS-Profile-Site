import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/admin/page-head";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isSectionKey, SECTION_DEFS } from "@/lib/admin/fields";
import { SECTION_TABLES } from "@/lib/admin/sections";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { cn, num } from "@/lib/utils";

// Signed-in, per-request page: allowed to block instead of streaming a placeholder.
export const instant = false;

export default async function SectionList({ params }: PageProps<"/admin/[section]">) {
  const { section } = await params;
  await requireUser(`/admin/${section}`);
  if (!isSectionKey(section)) notFound();
  const def = SECTION_DEFS[section];
  const { table, order } = SECTION_TABLES[section];
  const db = await getDb();
  const rows = (await db.select().from(table).orderBy(...order)) as Record<string, unknown>[];

  return (
    <>
      <PageHead
        title={def.label}
        action={
          <Link href={`/admin/${section}/new`} className={cn(buttonVariants(), "no-underline")}>
            <PlusIcon /> Add {def.singular}
          </Link>
        }
      >
        {"help" in def ? def.help : null}
      </PageHead>
      {rows.length === 0 ? (
        <p className="rounded-lg border bg-card p-6 text-muted-foreground">Nothing here yet.</p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {def.columns.map(([, label]) => <TableHead key={label}>{label}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={String(row.id)}>
                  {def.columns.map(([field], i) => (
                    <TableCell key={field} className={cn(i === 0 && "font-semibold", "max-w-md")}>
                      {i === 0 ? (
                        <Link href={`/admin/${section}/${row.id}`}>{show(row[field], field)}</Link>
                      ) : (
                        <span className="line-clamp-2">{show(row[field], field)}</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function show(v: unknown, field: string) {
  if (["year", "month", "sort"].includes(field)) return String(v ?? "");
  if (typeof v === "boolean") return v ? <Badge variant="success">Yes</Badge> : <Badge>No</Badge>;
  if (typeof v === "number") return num(v, Number.isInteger(v) ? 0 : 1);
  return String(v ?? "");
}
