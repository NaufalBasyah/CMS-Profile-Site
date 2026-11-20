import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { ItemForm } from "@/components/admin/item-form";
import { PageHead } from "@/components/admin/page-head";
import { deleteItem, saveItem } from "@/lib/admin/actions";
import { isSectionKey, SECTION_DEFS } from "@/lib/admin/fields";
import { SECTION_TABLES } from "@/lib/admin/sections";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

// Signed-in, per-request page: allowed to block instead of streaming a placeholder.
export const instant = false;

export default async function EditItem({ params }: PageProps<"/admin/[section]/[id]">) {
  const { section, id: rawId } = await params;
  await requireUser(`/admin/${section}/${rawId}`);
  const id = Number(rawId);
  if (!isSectionKey(section) || !Number.isInteger(id)) notFound();
  const def = SECTION_DEFS[section];
  const { table } = SECTION_TABLES[section];
  const db = await getDb();
  const [row] = (await db.select().from(table).where(eq(table.id, id)).limit(1)) as Record<string, unknown>[];
  if (!row) notFound();
  const initial = Object.fromEntries(
    def.fields.map((f) => {
      const v = row[f.name];
      return [f.name, typeof v === "boolean" ? (v ? "1" : "") : String(v ?? "")];
    }),
  );
  return (
    <>
      <PageHead
        title={`Edit ${def.singular}`}
        back={{ href: `/admin/${section}`, label: def.label }}
        action={<DeleteButton action={deleteItem.bind(null, section, id)} what={def.singular} />}
      />
      <ItemForm fields={def.fields} initial={initial} action={saveItem.bind(null, section, id)} submitLabel="Save changes" />
    </>
  );
}
