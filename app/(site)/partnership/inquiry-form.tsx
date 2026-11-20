"use client";

import { CheckCircle2Icon } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { sendInquiry, type InquiryState } from "./actions";

const INTERESTS = ["Supply agreement", "Sample", "Technical data", "Distribution", "New grade development", "Other"];

export function InquiryForm({ grades, interest }: { grades: string[]; interest: string }) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(sendInquiry, {});
  const v = state.values ?? {};

  if (state.sent) {
    return (
      <div role="status" className="flex gap-3 rounded-lg border border-success/30 bg-success/8 p-6">
        <CheckCircle2Icon className="mt-0.5 size-6 shrink-0 text-success" />
        <div>
          <p className="font-semibold text-heading">Message sent.</p>
          <p className="text-muted-foreground">Our sales team will reply within two working days.</p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5">
      {state.error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Your name" error={state.errors?.name}>
          <Input id="name" name="name" autoComplete="name" required defaultValue={v.name} aria-invalid={!!state.errors?.name} aria-describedby="name-error" />
        </Field>
        <Field id="company" label="Company" error={state.errors?.company}>
          <Input id="company" name="company" autoComplete="organization" required defaultValue={v.company} aria-invalid={!!state.errors?.company} aria-describedby="company-error" />
        </Field>
        <Field id="email" label="Work email" error={state.errors?.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={v.email} aria-invalid={!!state.errors?.email} aria-describedby="email-error" />
        </Field>
        <Field id="country" label="Country" optional>
          <Input id="country" name="country" autoComplete="country-name" defaultValue={v.country} />
        </Field>
        <Field id="interest" label="I'm interested in">
          <NativeSelect id="interest" name="interest" defaultValue={v.interest || interest || INTERESTS[0]}>
            {INTERESTS.map((o) => <option key={o}>{o}</option>)}
          </NativeSelect>
        </Field>
        <Field id="grade" label="Grade" optional>
          <NativeSelect id="grade" name="grade" defaultValue={v.grade ?? ""}>
            <option value="">Not sure yet</option>
            {grades.map((g) => <option key={g}>{g}</option>)}
          </NativeSelect>
        </Field>
        <Field id="volume" label="Expected volume" optional hint="e.g. 20 t per month" className="sm:col-span-2">
          <Input id="volume" name="volume" defaultValue={v.volume} />
        </Field>
        <Field id="message" label="Message" optional className="sm:col-span-2">
          <Textarea id="message" name="message" defaultValue={v.message} />
        </Field>
      </div>
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending…" : "Send an inquiry"}
      </Button>
    </form>
  );
}

function Field({
  id, label, optional, hint, error, className, children,
}: {
  id: string; label: string; optional?: boolean; hint?: string; error?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={id}>
        {label}
        {(optional || hint) && (
          <span className="font-normal text-muted-foreground"> ({[optional && "optional", hint].filter(Boolean).join(", ")})</span>
        )}
      </Label>
      {children}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}
