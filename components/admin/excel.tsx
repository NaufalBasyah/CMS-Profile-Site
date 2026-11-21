import { DownloadIcon, FileSpreadsheetIcon, PlusIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import { PageHead } from "@/components/admin/page-head";
import { ImportForm } from "@/components/admin/import-form";
import { buttonVariants } from "@/components/ui/button";
import { importItems } from "@/lib/admin/actions";
import { excelColumns, excelMapping, type ExcelKey } from "@/lib/admin/excel";
import { cn } from "@/lib/utils";

/** Buttons at the top of a section's list: Export, Import and (optionally) Add. */
export function ListActions({ section, add }: { section: ExcelKey; add?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Plain <a>: these are file downloads, not pages to prefetch. */}
      <a href={`/admin/excel/${section}/export`} className={cn(buttonVariants({ variant: "outline" }), "no-underline")} download>
        <DownloadIcon /> Export to Excel
      </a>
      <Link href={`/admin/${section}/import`} className={cn(buttonVariants({ variant: "outline" }), "no-underline")}>
        <UploadIcon /> Import from Excel
      </Link>
      {add && (
        <Link href={`/admin/${section}/new`} className={cn(buttonVariants(), "no-underline")}>
          <PlusIcon /> Add {add}
        </Link>
      )}
    </div>
  );
}

/** The import page for a section: download the template, fill it, upload it. */
export function ImportView({ section }: { section: ExcelKey }) {
  const { label, singular } = excelMapping(section);
  const cols = excelColumns(section).filter((c) => c.kind !== "id");
  return (
    <>
      <PageHead title={`Import ${label.toLowerCase()} from Excel`} back={{ href: `/admin/${section}`, label }}>
        Add or update many {label.toLowerCase()} at once from an Excel file.
      </PageHead>

      <ol className="space-y-6">
        <li className="rounded-lg border bg-card p-5 sm:p-6">
          <h2 className="text-2xl">1. Get the template</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            The template has one column per field, dropdowns for fixed choices and a &ldquo;How to fill&rdquo; sheet. To
            change existing {label.toLowerCase()}, export them instead: the export keeps each row&apos;s ID, so edited rows
            update in place.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`/admin/excel/${section}/template`} className={cn(buttonVariants(), "no-underline")} download>
              <FileSpreadsheetIcon /> Download the template
            </a>
            <a href={`/admin/excel/${section}/export`} className={cn(buttonVariants({ variant: "outline" }), "no-underline")} download>
              <DownloadIcon /> Export current {label.toLowerCase()}
            </a>
          </div>
          <details className="mt-5">
            <summary className="cursor-pointer text-sm font-semibold text-primary">Columns in this template</summary>
            <ul className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
              {cols.map((c) => (
                <li key={c.name}>
                  <span className="font-semibold text-heading">{c.header}</span>
                  {c.required && <span className="text-destructive"> *</span>}
                  {c.options && <span className="text-muted-foreground">: {c.options.join(", ")}</span>}
                </li>
              ))}
            </ul>
          </details>
        </li>

        <li className="rounded-lg border bg-card p-5 sm:p-6">
          <h2 className="text-2xl">2. Upload the filled file</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every row is checked before anything is saved. If a row has a problem, nothing is imported and this page lists
            what to fix, by Excel row number.
          </p>
          <ImportForm action={importItems.bind(null, section)} singular={singular} plural={label.toLowerCase()} />
        </li>
      </ol>
    </>
  );
}
