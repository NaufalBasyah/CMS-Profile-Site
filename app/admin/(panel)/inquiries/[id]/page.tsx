import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHead } from "@/components/admin/page-head";
import { Button } from "@/components/ui/button";
import { deleteInquiry, setInquiryStatus } from "@/lib/admin/actions";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema as t } from "@/lib/db";
import { StatusBadge } from "@/components/admin/status-badge";

// Signed-in, per-request page: allowed to block instead of streaming a placeholder.
export const instant = false;

export default async function InquiryPage({ params }: PageProps<"/admin/inquiries/[id]">) {
  const { id: rawId } = await params;
  await requireUser(`/admin/inquiries/${rawId}`);
  const id = Number(rawId);
  if (!Number.isInteger(id)) notFound();
  const db = await getDb();
  const [r] = await db.select().from(t.inquiries).where(eq(t.inquiries.id, id)).limit(1);
  if (!r) notFound();
  const rows: [string, React.ReactNode][] = [
    ["Received", r.createdAt.toISOString().replace("T", " ").slice(0, 16) + " UTC"],
    ["Name", r.name],
    ["Company", r.company],
    ["Email", <a key="e" href={`mailto:${r.email}`}>{r.email}</a>],
    ["Country", r.country || "—"],
    ["Interested in", r.interest || "—"],
    ["Grade", r.grade || "—"],
    ["Expected volume", r.volume || "—"],
    ["Status", <StatusBadge key="s" status={r.status} />],
  ];
  return (
    <>
      <PageHead
        title={r.company}
        back={{ href: "/admin/inquiries", label: "Inquiries" }}
        action={<DeleteButton action={deleteInquiry.bind(null, id)} what="inquiry" />}
      />
      <div className="rounded-lg border bg-card">
        <dl className="divide-y">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[10rem_1fr]">
              <dt className="text-sm font-semibold text-heading">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="border-t px-5 py-4">
          <p className="mb-2 text-sm font-semibold text-heading">Message</p>
          <p className="whitespace-pre-line">{r.message || "No message."}</p>
        </div>
      </div>
      <form action={setInquiryStatus.bind(null, id)} className="mt-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-muted-foreground">Mark as</span>
        {["New", "Replied", "Closed"].map((s) => (
          <Button key={s} type="submit" name="status" value={s} variant={s === r.status ? "default" : "outline"} size="sm">{s}</Button>
        ))}
      </form>
    </>
  );
}
