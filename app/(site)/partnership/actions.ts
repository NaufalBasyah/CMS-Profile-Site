"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { getDb, schema as t } from "@/lib/db";

export type InquiryState = {
  sent?: boolean;
  error?: string;
  errors?: Partial<Record<"name" | "company" | "email", string>>;
  values?: Record<string, string>;
};

const Inquiry = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  company: z.string().trim().min(1, "Enter your company name.").max(160),
  email: z.email("Enter an email address like name@company.com.").max(160),
  country: z.string().trim().max(80),
  interest: z.string().trim().max(80),
  grade: z.string().trim().max(40),
  volume: z.string().trim().max(80),
  message: z.string().trim().max(2000),
});

const FIELDS = ["name", "company", "email", "country", "interest", "grade", "volume", "message"] as const;

export async function sendInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  // Honeypot: real visitors never see this field. Pretend it worked.
  if (String(form.get("website") ?? "")) return { sent: true };

  const values = Object.fromEntries(FIELDS.map((f) => [f, String(form.get(f) ?? "")]));
  const parsed = Inquiry.safeParse({ ...values, email: values.email.trim() });
  if (!parsed.success) {
    const errors: InquiryState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "name" | "company" | "email";
      if (["name", "company", "email"].includes(key) && !errors[key]) errors[key] = issue.message;
    }
    return { errors, values, error: "Check the highlighted fields and send the form again." };
  }
  try {
    const db = await getDb();
    await db.insert(t.inquiries).values(parsed.data);
  } catch (err) {
    console.error("Saving inquiry failed", err);
    return { values, error: "We couldn't send your message just now. Please try again, or email us directly." };
  }
  updateTag("inquiries");
  return { sent: true };
}
