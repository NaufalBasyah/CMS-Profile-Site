"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImportState } from "@/lib/admin/actions";

type Action = (prev: ImportState, form: FormData) => Promise<ImportState>;

export function ImportForm({ action, singular, plural }: { action: Action; singular: string; plural: string }) {
  const [state, formAction, pending] = useActionState<ImportState, FormData>(action, {});
  const [mode, setMode] = useState<"merge" | "replace">("merge");

  return (
    <form action={formAction} className="mt-5 space-y-5">
      {state.error && (
        <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <p className="font-semibold">{state.error}</p>
          {state.problems && state.problems.length > 0 && (
            <ul className="mt-2 max-h-72 list-disc space-y-0.5 overflow-y-auto pl-5">
              {state.problems.map((p) => <li key={p}>{p}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="import-file">Excel file (.xlsx)</Label>
        <input
          id="import-file"
          name="file"
          type="file"
          required
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="block text-sm file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-secondary file:px-4 file:font-semibold file:text-heading"
        />
        <p className="text-sm text-muted-foreground">Up to 3.5 MB and 5,000 rows.</p>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-semibold text-heading">What should the import do?</legend>
        <label className="flex items-start gap-3 rounded-md border p-3 has-checked:border-primary has-checked:bg-primary/5">
          <input type="radio" name="mode" value="merge" checked={mode === "merge"} onChange={() => setMode("merge")} className="mt-1 size-4 accent-primary" />
          <span>
            <span className="block font-semibold text-heading">Add and update</span>
            <span className="text-sm text-muted-foreground">
              Rows with an ID update that {singular}; rows without one are added. Nothing else changes.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-md border p-3 has-checked:border-destructive has-checked:bg-destructive/5">
          <input type="radio" name="mode" value="replace" checked={mode === "replace"} onChange={() => setMode("replace")} className="mt-1 size-4 accent-destructive" />
          <span>
            <span className="block font-semibold text-heading">Replace everything</span>
            <span className="text-sm text-muted-foreground">
              Deletes all current {plural} and keeps only the rows in the file. This can&apos;t be undone, so export a copy first.
            </span>
          </span>
        </label>
        {mode === "replace" && (
          <label className="flex items-center gap-3 pt-1 text-sm font-medium">
            <Checkbox name="confirmReplace" required /> I understand all current {plural} will be deleted.
          </label>
        )}
      </fieldset>

      <Button type="submit" disabled={pending} variant={mode === "replace" ? "destructive" : "default"}>
        {pending ? "Importing…" : mode === "replace" ? `Replace ${plural}` : `Import ${plural}`}
      </Button>
    </form>
  );
}
