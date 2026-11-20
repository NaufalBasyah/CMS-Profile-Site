import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label data-slot="label" className={cn("text-sm font-semibold text-heading", className)} {...props} />;
}

function FieldError({ children, id }: { children?: React.ReactNode; id?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {children}
    </p>
  );
}

export { Label, FieldError };
