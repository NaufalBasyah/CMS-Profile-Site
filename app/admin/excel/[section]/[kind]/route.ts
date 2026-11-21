import { buildWorkbook, excelMapping, isExcelKey } from "@/lib/admin/excel";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

/**
 * GET /admin/excel/<section>/template  an empty Excel template for that section
 * GET /admin/excel/<section>/export    everything in that section, as Excel
 */
export async function GET(_req: Request, { params }: RouteContext<"/admin/excel/[section]/[kind]">) {
  const { section, kind } = await params;
  await requireUser(`/admin/${section}`);
  if (!isExcelKey(section) || (kind !== "template" && kind !== "export")) {
    return new Response("Not found", { status: 404 });
  }

  let rows: Record<string, unknown>[] | null = null;
  if (kind === "export") {
    const { table, order } = excelMapping(section);
    const db = await getDb();
    rows = (await db.select().from(table).orderBy(...order)) as Record<string, unknown>[];
  }
  const body = await buildWorkbook(section, rows);
  const date = new Date().toISOString().slice(0, 10);
  const name = kind === "template" ? `cms-${section}-template.xlsx` : `cms-${section}-${date}.xlsx`;

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
