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
