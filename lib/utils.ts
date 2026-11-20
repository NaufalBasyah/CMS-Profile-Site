import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function num(value: number, digits = 0): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** US$ with a k/M suffix: 4,212,000 → "US$4.2M", 547,400 → "US$547k". */
export function usd(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `US$${num(value / 1_000_000, 1)}M`;
  if (Math.abs(value) >= 1_000) return `US$${num(value / 1_000)}k`;
  return `US$${num(value)}`;
}

export function longDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function paragraphs(text: string): string[] {
  return (text || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
