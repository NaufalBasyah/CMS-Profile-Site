"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, NativeSelect, Textarea } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import type { FormState } from "@/lib/admin/actions";
import type { Field } from "@/lib/admin/fields";

type Action = (prev: FormState, form: FormData) => Promise<FormState>;

export function ItemForm({ fields, initial, action, submitLabel }: {
  fields: Field[]; initial: Record<string, string>; action: Action; submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const values = state.values ?? initial;
  const err = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-6 rounded-lg border bg-card p-5 sm:p-6">
      {state.error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {fields.map((f) => {
        const kind = f.kind ?? "text";
        const id = `f-${f.name}`;
        const common = { id, name: f.name, "aria-invalid": !!err[f.name], "aria-describedby": `${id}-help ${id}-err` };
        if (kind === "bool") {
          return (
            <div key={f.name} className="flex items-center gap-3">
              <Checkbox id={id} name={f.name} defaultChecked={values[f.name] === "1"} />
              <Label htmlFor={id} className="font-medium">{f.label}</Label>
            </div>
          );
        }
        return (
          <div key={f.name} className="flex flex-col gap-1.5">
            <Label htmlFor={kind === "image" ? `${id}-file` : id}>
              {f.label}
              {f.required && <span className="text-destructive"> *</span>}
            </Label>
            {kind === "textarea" ? (
              <Textarea {...common} defaultValue={values[f.name]} rows={f.name === "body" ? 12 : 4} />
            ) : kind === "select" ? (
              <NativeSelect {...common} defaultValue={values[f.name]}>
                {(f.options ?? []).map((o) => <option key={o}>{o}</option>)}
              </NativeSelect>
            ) : kind === "image" ? (
              <div className="space-y-2">
                <input type="hidden" name={`${f.name}__current`} value={values[f.name] ?? ""} />
                {values[f.name] && (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded image */}
                    <img src={values[f.name]} alt="" className="h-20 w-32 rounded border object-cover" />
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox name={`${f.name}__remove`} /> Remove image
                    </label>
                  </div>
                )}
                <input id={`${id}-file`} name={`${f.name}__file`} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                  className="block text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:font-semibold file:text-heading" />
                <p className="text-sm text-muted-foreground">JPG, PNG, WebP or GIF, up to 3 MB.</p>
              </div>
            ) : (
              <Input
                {...common}
                type={kind === "date" ? "date" : "text"}
                inputMode={kind === "int" ? "numeric" : kind === "float" ? "decimal" : undefined}
                defaultValue={values[f.name]}
                className={kind === "int" || kind === "float" ? "max-w-xs" : undefined}
              />
            )}
            {f.help && <p id={`${id}-help`} className="text-sm text-muted-foreground">{f.help}</p>}
            <FieldError id={`${id}-err`}>{err[f.name]}</FieldError>
          </div>
        );
      })}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
