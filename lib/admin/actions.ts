"use server";

/**
 * Admin panel actions. Every one checks the session first: the proxy only
 * keeps signed-out visitors away from admin pages, it does not protect actions.
 * Anything that changes public content refreshes the site with updateTag(CONTENT).
 */
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, requireUser } from "@/lib/auth/session";
import { CONTENT } from "@/lib/content";
import { getDb, schema as t } from "@/lib/db";
import { excelMapping, isExcelKey, naturalKey, parseWorkbook } from "./excel";
import { isSectionKey, SECTION_DEFS, type Field } from "./fields";
import { SECTION_TABLES } from "./sections";

const MAX_UPLOAD = 3 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type FormState = { error?: string; errors?: Record<string, string>; values?: Record<string, string> };

/**
 * Called after every successful change: shows a one-off confirmation and clears
 * the browser's cached admin pages, so lists and forms show the new data.
 */
async function flash(message: string) {
  revalidatePath("/", "layout");
  (await cookies()).set("cms_flash", message, { path: "/admin", maxAge: 30, sameSite: "lax" });
}

/* ---------- login ---------- */

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");
  const db = await getDb();
  const [user] = await db.select().from(t.users).where(eq(t.users.username, username)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "That username and password don't match.", values: { username } };
  }
  await createSession(user.username);
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- content sections ---------- */

async function parse(fields: Field[], form: FormData) {
  const values: Record<string, unknown> = {};
  const raw: Record<string, string> = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const kind = f.kind ?? "text";
    if (kind === "bool") {
      values[f.name] = form.get(f.name) === "on";
      raw[f.name] = values[f.name] ? "1" : "";
      continue;
    }
    if (kind === "image") {
      let url = String(form.get(`${f.name}__current`) ?? "").trim();
      const file = form.get(`${f.name}__file`);
      if (file instanceof File && file.size > 0) {
        if (!IMAGE_TYPES.has(file.type)) errors[f.name] = "Upload a JPG, PNG, WebP or GIF image.";
        else if (file.size > MAX_UPLOAD) errors[f.name] = "Use an image smaller than 3 MB.";
        else {
          const db = await getDb();
          const [m] = await db
            .insert(t.media)
            .values({ filename: file.name.slice(0, 200), contentType: file.type, data: Buffer.from(await file.arrayBuffer()) })
            .returning({ id: t.media.id });
          url = `/media/${m.id}`;
        }
      }
      if (form.get(`${f.name}__remove`) === "on") url = "";
      values[f.name] = url;
      raw[f.name] = url;
      continue;
    }
    const s = String(form.get(f.name) ?? "").trim();
    raw[f.name] = s;
    if (f.required && !s) {
      errors[f.name] = `Enter the ${f.label.toLowerCase()}.`;
      continue;
    }
    if (kind === "int" || kind === "float") {
      const n = s ? Number(s.replace(/,/g, "")) : 0;
      if (!Number.isFinite(n) || (kind === "int" && !Number.isInteger(n))) errors[f.name] = "Enter a number.";
      else values[f.name] = n;
    } else if (kind === "date") {
      if (s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) errors[f.name] = "Enter a date like 2026-11-20.";
      else values[f.name] = s || new Date().toISOString().slice(0, 10);
    } else {
      values[f.name] = s;
    }
  }
  return { values, raw, errors };
}

/** Create (id = null) or update an item. Bound in the form: saveItem.bind(null, key, id). */
export async function saveItem(key: string, id: number | null, _prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  if (!isSectionKey(key)) return { error: "Unknown section." };
  const def = SECTION_DEFS[key];
  const { table } = SECTION_TABLES[key];
  const { values, raw, errors } = await parse(def.fields, form);
  if (key === "news" && raw.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(raw.slug)) {
    errors.slug = "Use lowercase letters, numbers and hyphens only.";
  }
  if (key === "monthly" && !errors.month && (Number(values.month) < 1 || Number(values.month) > 12)) {
    errors.month = "Enter a month from 1 to 12.";
  }
  if (Object.keys(errors).length) {
    return { errors, values: raw, error: "Check the highlighted fields." };
  }
  const db = await getDb();
  try {
    if (id === null) await db.insert(table).values(values as never);
    else await db.update(table).set(values as never).where(eq(table.id, id));
  } catch (err) {
    const msg = String((err as { cause?: { message?: string } })?.cause?.message ?? err);
    if (/unique|duplicate/i.test(msg)) {
      return { values: raw, error: `Another ${def.singular} already uses that ${key === "news" ? "web address" : "year"}.` };
    }
    console.error(err);
    return { values: raw, error: "Saving failed. Try again." };
  }
  updateTag(CONTENT);
  await flash(`${def.singular[0].toUpperCase()}${def.singular.slice(1)} ${id === null ? "added" : "saved"}.`);
  redirect(`/admin/${key}`);
}

export async function deleteItem(key: string, id: number) {
  await requireUser();
  if (!isSectionKey(key)) return;
  const { table } = SECTION_TABLES[key];
  const db = await getDb();
  await db.delete(table).where(eq(table.id, id));
  updateTag(CONTENT);
  const s = SECTION_DEFS[key].singular;
  await flash(`${s[0].toUpperCase()}${s.slice(1)} deleted.`);
  redirect(`/admin/${key}`);
}

/* ---------- Excel import ---------- */

export type ImportState = { error?: string; problems?: string[] };

const MAX_IMPORT = 3.5 * 1024 * 1024;

/**
 * Imports a filled template or an edited export. All rows are checked first; if any
 * has a problem nothing is saved. Then everything is written in one transaction.
 * Bound in the form: importItems.bind(null, key).
 */
export async function importItems(key: string, _prev: ImportState, form: FormData): Promise<ImportState> {
  await requireUser(`/admin/${key}/import`);
  if (!isExcelKey(key)) return { error: "Unknown section." };
  const file = form.get("file");
  const mode = form.get("mode") === "replace" ? "replace" : "merge";
  if (!(file instanceof File) || file.size === 0) return { error: "Choose the Excel file to import." };
  if (!/\.xlsx$/i.test(file.name)) return { error: "Upload an .xlsx file. In Excel, use File › Save As › Excel Workbook." };
  if (file.size > MAX_IMPORT) return { error: "Use a file smaller than 3.5 MB." };
  if (mode === "replace" && form.get("confirmReplace") !== "on") {
    return { error: "Tick the box to confirm you want to replace everything in this section." };
  }

  const { rows, errors } = await parseWorkbook(key, await file.arrayBuffer());
  if (errors.length) {
    return {
      error: `Nothing was imported. Fix ${errors.length === 1 ? "this problem" : `these ${errors.length} problems`} in the file and upload it again.`,
      problems: errors.slice(0, 100),
    };
  }

  const { table, singular, label } = excelMapping(key);
  const natural = naturalKey(key);
  const db = await getDb();
  let added = 0;
  let updated = 0;
  let removed = 0;
  try {
    await db.transaction(async (tx) => {
      const existing = (await tx.select().from(table)) as Record<string, unknown>[];
      if (mode === "replace") {
        removed = existing.length;
        await tx.delete(table);
      }
      const byId = new Map(mode === "replace" ? [] : existing.map((r) => [Number(r.id), r]));
      const byNatural = new Map<string, number>();
      if (natural && mode === "merge") {
        for (const r of existing) {
          const k = natural.of(r);
          if (k !== null) byNatural.set(k, Number(r.id));
        }
      }
      const missing: string[] = [];
      for (const r of rows) {
        let target: number | null = null;
        if (mode === "merge" && r.id !== null) {
          if (!byId.has(r.id)) {
            missing.push(`Row ${r.line}: there is no ${singular} with ID ${r.id}. Clear the ID to add it as new.`);
            continue;
          }
          target = r.id;
        } else if (natural) {
          const k = natural.of(r.values);
          if (k !== null && byNatural.has(k)) target = byNatural.get(k)!;
        }
        if (target !== null) {
          await tx.update(table).set(r.values as never).where(eq(table.id, target));
          updated++;
        } else {
          await tx.insert(table).values(r.values as never);
          added++;
        }
      }
      if (missing.length) throw new ImportProblems(missing);
    });
  } catch (err) {
    if (err instanceof ImportProblems) {
      return { error: "Nothing was imported. Fix these rows and upload the file again.", problems: err.problems.slice(0, 100) };
    }
    const msg = String((err as { cause?: { message?: string } })?.cause?.message ?? err);
    console.error(err);
    if (/unique|duplicate/i.test(msg)) {
      return { error: `Nothing was imported: two ${label.toLowerCase()} would share the same ${natural?.label.toLowerCase() ?? "value"}.` };
    }
    return { error: "Nothing was imported because saving failed. Try again." };
  }

  if (key !== "inquiries") updateTag(CONTENT);
  const parts = [`${added} added`, `${updated} updated`];
  if (removed) parts.unshift(`${removed} removed`);
  await flash(`Import finished: ${parts.join(", ")}.`);
  redirect(`/admin/${key}`);
}

class ImportProblems extends Error {
  constructor(public problems: string[]) {
    super("import problems");
  }
}

/* ---------- settings ---------- */

export async function saveSettings(form: FormData) {
  await requireUser("/admin/settings");
  const db = await getDb();
  const rows = await db.select().from(t.settings);
  for (const row of rows) {
    let value: string | null = null;
    if (row.kind === "bool") value = form.get(row.key) === "on" ? "1" : "0";
    else if (form.has(row.key)) value = String(form.get(row.key)).trim();
    if (value !== null && value !== row.value) {
      await db.update(t.settings).set({ value }).where(eq(t.settings.id, row.id));
    }
  }
  updateTag(CONTENT);
  await flash("Site settings saved.");
  redirect("/admin/settings");
}

/* ---------- inquiries ---------- */

export async function setInquiryStatus(id: number, form: FormData) {
  await requireUser();
  const status = String(form.get("status") ?? "");
  if (["New", "Replied", "Closed"].includes(status)) {
    const db = await getDb();
    await db.update(t.inquiries).set({ status }).where(eq(t.inquiries.id, id));
    await flash(`Inquiry marked as ${status.toLowerCase()}.`);
  }
  redirect(`/admin/inquiries/${id}`);
}

export async function deleteInquiry(id: number) {
  await requireUser();
  const db = await getDb();
  await db.delete(t.inquiries).where(eq(t.inquiries.id, id));
  await flash("Inquiry deleted.");
  redirect("/admin/inquiries");
}

/* ---------- account ---------- */

export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const username = await requireUser("/admin/account");
  const current = String(form.get("current") ?? "");
  const next = String(form.get("new") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const db = await getDb();
  const [me] = await db.select().from(t.users).where(eq(t.users.username, username)).limit(1);
  if (!me || !verifyPassword(current, me.passwordHash)) return { error: "Your current password is incorrect." };
  if (next.length < 10) return { error: "Use at least 10 characters for the new password." };
  if (next !== confirm) return { error: "The new passwords don't match." };
  await db.update(t.users).set({ passwordHash: hashPassword(next) }).where(eq(t.users.id, me.id));
  await flash("Password changed.");
  redirect("/admin");
}
