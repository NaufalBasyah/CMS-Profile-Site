import { notFound } from "next/navigation";
import { ItemForm } from "@/components/admin/item-form";
import { PageHead } from "@/components/admin/page-head";
import { saveItem } from "@/lib/admin/actions";
import { isSectionKey, SECTION_DEFS } from "@/lib/admin/fields";
import { requireUser } from "@/lib/auth/session";

// Signed-in, per-request page: allowed to block instead of streaming a placeholder.
export const instant = false;

export default async function NewItem({ params }: PageProps<"/admin/[section]/new">) {
  const { section } = await params;
  await requireUser(`/admin/${section}/new`);
  if (!isSectionKey(section)) notFound();
  const def = SECTION_DEFS[section];
  const initial: Record<string, string> = {};
  for (const f of def.fields as { name: string; kind?: string; options?: string[] }[]) {
    if (f.kind === "bool") initial[f.name] = "1";
    if (f.kind === "select") initial[f.name] = f.options?.[0] ?? "";
    if (f.kind === "date") initial[f.name] = new Date().toISOString().slice(0, 10);
  }
  return (
    <>
      <PageHead title={`Add ${def.singular}`} back={{ href: `/admin/${section}`, label: def.label }} />
      <ItemForm fields={def.fields} initial={initial} action={saveItem.bind(null, section, null)} submitLabel={`Add ${def.singular}`} />
    </>
  );
}
