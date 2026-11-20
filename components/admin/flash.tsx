"use client";

import { CheckCircle2Icon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

/** One-off confirmation ("Product saved.") set by an admin action. Clears its cookie once shown. */
export function Flash({ message }: { message?: string }) {
  // Admin pages stay mounted between visits, so derive from the prop instead of copying it into state.
  const [dismissed, setDismissed] = useState<string | undefined>();
  const shown = message && message !== dismissed ? message : undefined;
  useEffect(() => {
    if (message) document.cookie = "cms_flash=; Max-Age=0; path=/admin";
  }, [message]);
  if (!shown) return null;
  return (
    <div role="status" className="mb-6 flex items-center gap-3 rounded-md border border-success/30 bg-success/8 px-4 py-3 text-sm font-medium text-heading">
      <CheckCircle2Icon className="size-4 text-success" />
      <span className="flex-1">{shown}</span>
      <button type="button" onClick={() => setDismissed(message)} aria-label="Dismiss" className="text-muted-foreground hover:text-heading">
        <XIcon className="size-4" />
      </button>
    </div>
  );
}
