import { cookies } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";
import { Flash } from "./flash";

export async function PageHead({
  title, back, children, action,
}: { title: string; back?: { href: string; label: string }; children?: ReactNode; action?: ReactNode }) {
  const flash = (await cookies()).get("cms_flash")?.value;
  return (
    <>
      <Flash message={flash} />
      {back && <Link href={back.href} className="text-sm font-semibold">Back to {back.label.toLowerCase()}</Link>}
      <div className="mt-1 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">{title}</h1>
          {children && <div className="mt-2 max-w-2xl text-muted-foreground">{children}</div>}
        </div>
        {action}
      </div>
    </>
  );
}
