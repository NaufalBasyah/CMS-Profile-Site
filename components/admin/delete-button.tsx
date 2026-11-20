"use client";

import { Button } from "@/components/ui/button";

/** A delete form that asks for confirmation first. */
export function DeleteButton({ action, what }: { action: () => Promise<void>; what: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete this ${what}? This can't be undone.`)) e.preventDefault();
      }}
    >
      <Button type="submit" variant="outline" size="sm" className="text-destructive hover:border-destructive hover:text-destructive">
        Delete {what}
      </Button>
    </form>
  );
}
