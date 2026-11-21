import "server-only";
/**
 * Excel templates, exports and imports for the admin sections.
 *
 * Every section in SECTION_DEFS (plus Inquiries) gets the same three things:
 * - a template: the right columns, dropdowns for fixed choices, and a "How to fill"
 *   sheet that explains each column;
 * - an export: the same columns, filled with what is in the database;
 * - an import: reads a filled template (or an edited export) back in.
 *
 * Columns come from the section's fields, so a field added in fields.ts shows up in
 * its template automatically. The first column is the row's ID: an export carries
 * it so edited rows update in place; leave it empty in a template to add new rows.
 */
import ExcelJS from "exceljs";
import { asc, desc, getTableColumns, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { schema as t } from "@/lib/db";
import { isSectionKey, SECTION_DEFS, type Field, type FieldKind, type SectionKey } from "./fields";
import { SECTION_TABLES } from "./sections";

export type ExcelKey = SectionKey | "inquiries";

export type ExcelColumn = {
  name: string;
  header: string;
  kind: FieldKind | "id" | "datetime";
  required?: boolean;
  options?: string[];
  help?: string;
  /** Longest text the database column holds, read from the schema. */
  maxLength?: number;
};

type Mapping = { label: string; singular: string; table: PgTable & { id: PgColumn }; order: SQL[]; fields: Field[] };

const INQUIRY_FIELDS: Field[] = [
  { name: "createdAt", label: "Received", kind: "date", help: "Date and time the inquiry arrived, in UTC (Jakarta time minus 7 hours). Leave blank for now." },
  { name: "name", label: "Name", required: true },
  { name: "company", label: "Company", required: true },
  { name: "email", label: "Email", required: true },
  { name: "country", label: "Country" },
  { name: "interest", label: "Interest" },
  { name: "grade", label: "Grade" },
  { name: "volume", label: "Volume" },
  { name: "message", label: "Message", kind: "textarea" },
  { name: "status", label: "Status", kind: "select", options: ["New", "Replied", "Closed"] },
];

export function isExcelKey(key: string): key is ExcelKey {
  return key === "inquiries" || isSectionKey(key);
}

export function excelMapping(key: ExcelKey): Mapping {
  if (key === "inquiries") {
    return {
      label: "Inquiries",
      singular: "inquiry",
      table: t.inquiries,
      order: [desc(t.inquiries.createdAt), asc(t.inquiries.id)],
      fields: INQUIRY_FIELDS,
    };
  }
  const def = SECTION_DEFS[key];
  return { label: def.label, singular: def.singular, ...SECTION_TABLES[key], fields: def.fields };
}

/** Excel refuses some sheet names ("History" among them) and caps them at 31 characters. */
function sheetName(key: ExcelKey): string {
  const { label } = excelMapping(key);
  return (label.toLowerCase() === "history" ? "History entries" : label).slice(0, 31);
}

export function excelColumns(key: ExcelKey): ExcelColumn[] {
  const { table, fields } = excelMapping(key);
  const dbCols = getTableColumns(table) as Record<string, PgColumn & { length?: number }>;
  const cols: ExcelColumn[] = [
    {
      name: "id",
      header: "ID",
      kind: "id",
      help: "Leave empty to add a new row. Filled in by Export: keep it to update that row.",
    },
  ];
  for (const f of fields) {
    const kind = key === "inquiries" && f.name === "createdAt" ? "datetime" : (f.kind ?? "text");
    const length = dbCols[f.name]?.length;
    cols.push({
      name: f.name,
      header: f.label,
      kind,
      required: f.required,
      options: kind === "bool" ? ["Yes", "No"] : f.options,
      help: f.help,
      maxLength: typeof length === "number" ? length : undefined,
    });
  }
  return cols;
}

/* ------------------------------------------------------------------ writing */

type RangeValidations = { dataValidations: { add(range: string, rule: ExcelJS.DataValidation): void } };

const BRAND = "FF2E2A8F"; // header fill, the admin's indigo
const WIDTH: Record<ExcelColumn["kind"], number> = {
  id: 8, text: 26, textarea: 48, int: 12, float: 16, date: 14, datetime: 18, bool: 12, select: 18, image: 36,
};

function typeText(c: ExcelColumn): string {
  switch (c.kind) {
    case "id": return "Whole number, or empty";
    case "int": return "Whole number";
    case "float": return "Number";
    case "date": return "Date (e.g. 2026-11-20)";
    case "datetime": return "Date and time (e.g. 2026-11-20 14:30)";
    case "bool": return "Yes or No";
    case "select": return `One of: ${c.options?.join(", ")}`;
    case "image": return "Image web address (/media/… or https://…), or empty";
    case "textarea": return "Text (line breaks allowed)";
    default: return "Text";
  }
}

function blankMeaning(c: ExcelColumn): string {
  if (c.required) return "Required";
  switch (c.kind) {
    case "id": return "Adds a new row";
    case "int":
    case "float": return "Saved as 0";
    case "date": return "Today";
    case "datetime": return "Now";
    case "bool": return "Yes";
    case "select": return c.options?.[0] ?? "";
    default: return "Left empty";
  }
}

function toCell(c: ExcelColumn, v: unknown): ExcelJS.CellValue {
  if (v === null || v === undefined) return null;
  switch (c.kind) {
    case "bool": return v ? "Yes" : "No";
    case "date": return typeof v === "string" && v ? new Date(`${v}T00:00:00Z`) : null;
    case "datetime": return v instanceof Date ? v : new Date(String(v));
    default: return v as ExcelJS.CellValue;
  }
}

/** A template (rows = null) or an export (rows = database rows), as .xlsx bytes. */
export async function buildWorkbook(key: ExcelKey, rows: Record<string, unknown>[] | null): Promise<Buffer> {
  const cols = excelColumns(key);
  const wb = new ExcelJS.Workbook();
  wb.creator = "CMS Chemical admin";
  wb.created = new Date();

  const ws = wb.addWorksheet(sheetName(key), { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = cols.map((c) => ({
    key: c.name,
    header: c.required ? `${c.header} *` : c.header,
    width: WIDTH[c.kind],
    style: {
      alignment: { vertical: "top", wrapText: c.kind === "textarea" },
      numFmt: c.kind === "date" ? "yyyy-mm-dd" : c.kind === "datetime" ? "yyyy-mm-dd hh:mm" : c.kind === "float" ? "#,##0.##" : undefined,
    },
  }));
  const head = ws.getRow(1);
  head.height = 22;
  // No cell notes on the headers: after Excel or another app re-saves the file, exceljs
  // can't read them back. The "How to fill" sheet explains each column instead.
  head.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
    cell.alignment = { vertical: "middle" };
  });

  for (const row of rows ?? []) {
    ws.addRow(Object.fromEntries(cols.map((c) => [c.name, toCell(c, row[c.name])])));
  }

  // Dropdowns and number checks on the data rows, including empty ones to fill in.
  const last = Math.max(500, (rows?.length ?? 0) + 200);
  cols.forEach((c, i) => {
    const letter = ws.getColumn(i + 1).letter;
    let rule: ExcelJS.DataValidation | null = null;
    if (c.options?.length) {
      rule = {
        type: "list", allowBlank: !c.required, formulae: [`"${c.options.join(",")}"`],
        showErrorMessage: true, errorTitle: c.header, error: `Choose one of: ${c.options.join(", ")}`,
      };
    } else if (c.kind === "int" || c.kind === "id") {
      rule = { type: "whole", operator: "greaterThanOrEqual", allowBlank: true, formulae: [c.kind === "id" ? 1 : -1e9], showErrorMessage: true, error: "Enter a whole number." };
    } else if (c.kind === "float") {
      rule = { type: "decimal", operator: "between", allowBlank: true, formulae: [-1e15, 1e15], showErrorMessage: true, error: "Enter a number." };
    }
    // exceljs supports range validations at runtime but leaves them out of its types.
    if (rule) (ws as unknown as RangeValidations).dataValidations.add(`${letter}2:${letter}${last}`, rule);
  });

  // The guide sheet.
  const guide = wb.addWorksheet("How to fill");
  guide.columns = [
    { header: "Column", key: "col", width: 26 },
    { header: "What to enter", key: "type", width: 46 },
    { header: "If left empty", key: "blank", width: 20 },
    { header: "Notes", key: "help", width: 70 },
  ];
  guide.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
  });
  for (const c of cols) {
    const r = guide.addRow({
      col: c.required ? `${c.header} *` : c.header,
      type: typeText(c) + (c.maxLength ? ` (up to ${c.maxLength} characters)` : ""),
      blank: blankMeaning(c),
      help: c.help ?? "",
    });
    r.alignment = { vertical: "top", wrapText: true };
  }
  guide.addRow({});
  for (const line of [
    `Fill one row per ${excelMapping(key).singular} on the "${sheetName(key)}" sheet, starting on row 2. Columns marked * are required.`,
    "Keep the header row as it is. Column order can change; extra columns are ignored.",
    "Rows with an ID update the item with that ID. Rows without an ID are added as new items.",
    "Then upload the file on the Import page. If any row has a problem, nothing is imported and the page lists what to fix.",
  ]) {
    guide.addRow({ col: line }).getCell(1).alignment = { wrapText: false };
  }

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/* ------------------------------------------------------------------ reading */

export type ParsedRow = { line: number; id: number | null; values: Record<string, unknown> };
export type ParseResult = { rows: ParsedRow[]; errors: string[] };

const MAX_ROWS = 5000;

function plain(v: ExcelJS.CellValue): string | number | boolean | Date | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Date || typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((p) => p.text).join("");
    if ("result" in v) return plain(v.result as ExcelJS.CellValue);
    if ("text" in v) return String(v.text);
    if ("error" in v) return null;
  }
  return String(v);
}

function excelSerialToDate(n: number): Date {
  return new Date(Math.round((n - 25569) * 86400 * 1000));
}

function normalizeHeader(s: string): string {
  return s.replace(/\*/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Reads an uploaded .xlsx into checked rows. Errors name the Excel row and column. */
export async function parseWorkbook(key: ExcelKey, data: ArrayBuffer): Promise<ParseResult> {
  const cols = excelColumns(key);
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(data);
  } catch {
    return { rows: [], errors: ["That file couldn't be read as an Excel workbook. Save it as .xlsx and try again."] };
  }
  const ws = wb.getWorksheet(sheetName(key)) ?? wb.worksheets.find((s) => s.name !== "How to fill");
  if (!ws) return { rows: [], errors: ["The workbook has no data sheet."] };

  // Match header cells to columns by their label (or the field's own name).
  const byHeader = new Map<string, ExcelColumn>();
  for (const c of cols) {
    byHeader.set(normalizeHeader(c.header), c);
    byHeader.set(c.name.toLowerCase(), c);
  }
  const at = new Map<number, ExcelColumn>();
  ws.getRow(1).eachCell((cell, i) => {
    const c = byHeader.get(normalizeHeader(String(plain(cell.value) ?? "")));
    if (c) at.set(i, c);
  });
  const found = new Set([...at.values()].map((c) => c.name));
  const missing = cols.filter((c) => c.required && !found.has(c.name)).map((c) => `"${c.header}"`);
  if (missing.length) {
    return {
      rows: [],
      errors: [`The first row must hold the column headers. Missing: ${missing.join(", ")}. Download a fresh template to see them.`],
    };
  }

  const rows: ParsedRow[] = [];
  const errors: string[] = [];
  const today = new Date().toISOString().slice(0, 10);

  ws.eachRow({ includeEmpty: false }, (row, line) => {
    if (line === 1) return;
    const cells = new Map<string, ReturnType<typeof plain>>();
    for (const [i, c] of at) {
      let v = plain(row.getCell(i).value);
      if (typeof v === "string") v = v.trim();
      if (v !== null && v !== "") cells.set(c.name, v);
    }
    if (cells.size === 0) return; // a blank row
    if (rows.length >= MAX_ROWS) {
      if (rows.length === MAX_ROWS) errors.push(`Import up to ${MAX_ROWS} rows at a time.`);
      return;
    }

    const values: Record<string, unknown> = {};
    let id: number | null = null;
    const bad = (c: ExcelColumn, msg: string) => errors.push(`Row ${line}, ${c.header}: ${msg}`);

    for (const c of cols) {
      const v = cells.get(c.name) ?? null;
      if (c.kind === "id") {
        if (v === null) continue;
        const n = typeof v === "number" ? v : Number(String(v));
        if (!Number.isInteger(n) || n < 1) bad(c, "use a whole number, or leave it empty for a new row.");
        else id = n;
        continue;
      }
      if (v === null) {
        if (c.required) { bad(c, "this column is required."); continue; }
        if (!found.has(c.name)) continue; // column not in the file: leave the field as it is
        values[c.name] =
          c.kind === "int" || c.kind === "float" ? 0
          : c.kind === "date" ? today
          : c.kind === "datetime" ? new Date()
          : c.kind === "bool" ? true
          : c.kind === "select" ? (c.options?.[0] ?? "")
          : "";
        continue;
      }
      switch (c.kind) {
        case "int":
        case "float": {
          const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
          if (!Number.isFinite(n)) bad(c, `"${v}" is not a number.`);
          else if (c.kind === "int" && !Number.isInteger(n)) bad(c, "use a whole number.");
          else values[c.name] = n;
          break;
        }
        case "date": {
          const d = v instanceof Date ? v : typeof v === "number" ? excelSerialToDate(v) : null;
          const s = d ? d.toISOString().slice(0, 10) : String(v);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) bad(c, `"${v}" is not a date like 2026-11-20.`);
          else values[c.name] = s;
          break;
        }
        case "datetime": {
          const d = v instanceof Date ? v : typeof v === "number" ? excelSerialToDate(v) : new Date(String(v).replace(" ", "T"));
          if (Number.isNaN(d.getTime())) bad(c, `"${v}" is not a date and time like 2026-11-20 14:30.`);
          else values[c.name] = d;
          break;
        }
        case "bool": {
          const s = String(v).trim().toLowerCase();
          if (["yes", "y", "true", "1"].includes(s)) values[c.name] = true;
          else if (["no", "n", "false", "0"].includes(s)) values[c.name] = false;
          else bad(c, `use Yes or No (found "${v}").`);
          break;
        }
        case "select": {
          const s = String(v);
          const match = c.options?.find((o) => o.toLowerCase() === s.toLowerCase());
          if (!match) bad(c, `"${s}" is not one of: ${c.options?.join(", ")}.`);
          else values[c.name] = match;
          break;
        }
        case "image": {
          const s = String(v);
          if (!/^(\/|https:\/\/)/.test(s)) bad(c, "use a web address starting with / or https://, or leave it empty.");
          else values[c.name] = s;
          break;
        }
        default:
          values[c.name] = String(v instanceof Date ? v.toISOString().slice(0, 10) : v);
      }
      const val = values[c.name];
      if (c.maxLength && typeof val === "string" && val.length > c.maxLength) {
        bad(c, `keep it to ${c.maxLength} characters (this has ${val.length}).`);
      }
    }

    // Rules specific to one section, matching the add/edit form.
    if (key === "news" && typeof values.slug === "string" && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(values.slug)) {
      errors.push(`Row ${line}, Web address: use lowercase letters, numbers and hyphens only.`);
    }
    if (key === "monthly" && typeof values.month === "number" && (values.month < 1 || values.month > 12)) {
      errors.push(`Row ${line}, Month (1–12): enter a month from 1 to 12.`);
    }
    if (key === "inquiries" && typeof values.email === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.push(`Row ${line}, Email: "${values.email}" is not an email address.`);
    }
    rows.push({ line, id, values });
  });

  // Each year, month or web address may appear only once in the file.
  const natural = naturalKey(key);
  if (natural) {
    const seen = new Map<string, number>();
    for (const r of rows) {
      const k = natural.of(r.values);
      if (k === null) continue;
      const first = seen.get(k);
      if (first) errors.push(`Row ${r.line}: ${natural.label} ${k} is already used on row ${first}.`);
      else seen.set(k, r.line);
    }
  }
  const ids = new Map<number, number>();
  for (const r of rows) {
    if (r.id === null) continue;
    const first = ids.get(r.id);
    if (first) errors.push(`Row ${r.line}: ID ${r.id} is already used on row ${first}.`);
    else ids.set(r.id, r.line);
  }

  if (rows.length === 0 && errors.length === 0) errors.push("The sheet has no rows to import. Fill rows from row 2 down.");
  return { rows, errors };
}

/**
 * Fields that must be unique in a section. An imported row without an ID whose
 * year, month or web address already exists updates that item instead of failing.
 */
export function naturalKey(key: ExcelKey): { label: string; of: (v: Record<string, unknown>) => string | null } | null {
  if (key === "yearly") return { label: "Year", of: (v) => (v.year === undefined ? null : String(v.year)) };
  if (key === "monthly") {
    return {
      label: "Month",
      of: (v) => (v.year === undefined || v.month === undefined ? null : `${v.year}-${String(v.month).padStart(2, "0")}`),
    };
  }
  if (key === "news") return { label: "Web address", of: (v) => (typeof v.slug === "string" ? v.slug : null) };
  return null;
}
