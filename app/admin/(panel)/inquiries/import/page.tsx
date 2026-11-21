import { ImportView } from "@/components/admin/excel";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Import inquiries" };

// Signed-in, per-request page: allowed to block instead of streaming a placeholder.
export const instant = false;

export default async function ImportInquiriesPage() {
  await requireUser("/admin/inquiries/import");
  return <ImportView section="inquiries" />;
}
