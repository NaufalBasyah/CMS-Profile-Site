"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type FormState } from "@/lib/admin/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      {state.error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" autoComplete="username" required defaultValue={state.values?.username} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
