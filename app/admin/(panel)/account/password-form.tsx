"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword, type FormState } from "@/lib/admin/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, {});
  return (
    <form action={action} className="max-w-md space-y-4 rounded-lg border bg-card p-6">
      {state.error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm font-medium text-destructive">{state.error}</p>
      )}
      {[["current", "Current password", "current-password"], ["new", "New password (at least 10 characters)", "new-password"], ["confirm", "Repeat the new password", "new-password"]].map(([name, label, ac]) => (
        <div key={name} className="space-y-1.5">
          <Label htmlFor={name}>{label}</Label>
          <Input id={name} name={name} type="password" autoComplete={ac} required />
        </div>
      ))}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Change password"}</Button>
    </form>
  );
}
