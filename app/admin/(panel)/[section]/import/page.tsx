import { notFound } from "next/navigation";
import { ImportView } from "@/components/admin/excel";
import { isSectionKey } from "@/lib/admin/fields";
import { requireUser } from "@/lib/auth/session";

// Signed-in, per-request page: allowed to block instead of streaming a placeholder.
export const instant = false;

export default async function ImportPage({ params }: PageProps<"/admin/[section]/import">) {
  const { section } = await params;
  await requireUser(`/admin/${section}/import`);
  if (!isSectionKey(section)) notFound();
  return <ImportView section={section} />;
}
