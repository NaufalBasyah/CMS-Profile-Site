import { asc } from "drizzle-orm";
import { PageHead } from "@/components/admin/page-head";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSettings } from "@/lib/admin/actions";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema as t } from "@/lib/db";

export const metadata = { title: "Site settings" };

// Signed-in, per-request page: allowed to block instead of streaming a placeholder.
export const instant = false;

export default async function SettingsPage() {
  await requireUser("/admin/settings");
  const db = await getDb();
  const rows = await db.select().from(t.settings).orderBy(asc(t.settings.sort));
  const groups = Map.groupBy(rows, (r) => r.group);
  return (
    <>
      <PageHead title="Site settings">Company details, page introductions and contact information.</PageHead>
      <form action={saveSettings} className="space-y-6">
        {[...groups].map(([group, items]) => (
          <fieldset key={group} className="space-y-5 rounded-lg border bg-card p-5 sm:p-6">
            <legend className="px-1 font-display text-2xl text-heading">{group}</legend>
            {items.map((s) =>
              s.kind === "bool" ? (
                <div key={s.key} className="flex items-center gap-3">
                  <Checkbox id={s.key} name={s.key} defaultChecked={s.value === "1"} />
                  <Label htmlFor={s.key} className="font-medium">{s.label}</Label>
                </div>
              ) : (
                <div key={s.key} className="flex flex-col gap-1.5">
                  <Label htmlFor={s.key}>{s.label}</Label>
                  {s.kind === "textarea" ? (
                    <Textarea id={s.key} name={s.key} defaultValue={s.value} rows={3} className="min-h-24" />
                  ) : (
                    <Input id={s.key} name={s.key} defaultValue={s.value} />
                  )}
                </div>
              ),
            )}
          </fieldset>
        ))}
        <Button type="submit">Save settings</Button>
      </form>
    </>
  );
}
