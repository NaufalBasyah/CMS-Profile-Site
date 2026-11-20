/**
 * Describes every editable content type. The admin list, create, edit and
 * delete pages are generated from this. Shared by server and client code, so
 * it holds plain data only (database tables are mapped in sections.ts).
 *
 * To make a new table editable: add it to lib/db/schema.ts and ddl.ts, add an
 * entry here, map it in sections.ts, and show it on a page.
 */
export type FieldKind = "text" | "textarea" | "int" | "float" | "date" | "bool" | "select" | "image";

export type Field = {
  name: string;
  label: string;
  kind?: FieldKind;
  help?: string;
  options?: string[];
  required?: boolean;
};

export type SectionDef = {
  label: string;
  singular: string;
  group: "Content" | "Performance";
  help?: string;
  columns: [field: string, label: string][];
  fields: Field[];
};

export const SECTION_DEFS = {
  products: {
    label: "Products", singular: "product", group: "Content",
    columns: [["name", "Name"], ["physicalForm", "Form"], ["particleSize", "Particle size"], ["isActive", "Shown"]],
    fields: [
      { name: "name", label: "Product name", required: true },
      { name: "grade", label: "Grade", required: true },
      { name: "physicalForm", label: "Physical form", kind: "select", options: ["Bead", "Powder", "Flake", "Pellet"] },
      { name: "particleSize", label: "Particle size" },
      { name: "acidValue", label: "Acid value" },
      { name: "amineValue", label: "Amine value" },
      { name: "meltingPoint", label: "Melting point" },
      { name: "color", label: "Colour" },
      { name: "packing", label: "Packing", kind: "textarea", help: "One option per line." },
      { name: "bestFor", label: "Best for", kind: "textarea" },
      { name: "sort", label: "Display order", kind: "int" },
      { name: "isActive", label: "Show on the website", kind: "bool" },
    ],
  },
  applications: {
    label: "Applications", singular: "application", group: "Content",
    columns: [["name", "Name"], ["description", "Description"]],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "description", label: "Description", kind: "textarea" },
      { name: "sort", label: "Display order", kind: "int" },
    ],
  },
  milestones: {
    label: "History", singular: "milestone", group: "Content",
    help: "Keep figures out of history entries: numbers belong on the Performance page.",
    columns: [["year", "Year"], ["title", "Title"]],
    fields: [
      { name: "year", label: "Year", required: true },
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", kind: "textarea" },
      { name: "sort", label: "Display order", kind: "int" },
    ],
  },
  advantages: {
    label: "Advantages", singular: "advantage", group: "Content",
    columns: [["title", "Title"], ["description", "Description"]],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", kind: "textarea" },
      { name: "sort", label: "Display order", kind: "int" },
    ],
  },
  clients: {
    label: "Clients", singular: "client", group: "Content",
    columns: [["name", "Name"], ["country", "Country"], ["sector", "Sector"]],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "country", label: "Country" },
      { name: "sector", label: "Sector" },
      { name: "sort", label: "Display order", kind: "int" },
    ],
  },
  certifications: {
    label: "Certifications", singular: "certification", group: "Content",
    columns: [["name", "Name"], ["since", "Since"]],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "scope", label: "Scope", kind: "textarea" },
      { name: "since", label: "Held since" },
      { name: "sort", label: "Display order", kind: "int" },
    ],
  },
  news: {
    label: "News", singular: "news post", group: "Content",
    columns: [["title", "Title"], ["category", "Category"], ["publishedOn", "Date"], ["isPublished", "Published"]],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Web address", required: true, help: "Lowercase words joined by hyphens, e.g. new-reactor-line." },
      { name: "category", label: "Category", kind: "select", options: ["Company", "Product", "Events", "Sustainability"] },
      { name: "publishedOn", label: "Date", kind: "date" },
      { name: "summary", label: "Summary", kind: "textarea" },
      { name: "body", label: "Article", kind: "textarea", help: "Leave a blank line between paragraphs." },
      { name: "imageUrl", label: "Image", kind: "image" },
      { name: "isPublished", label: "Published", kind: "bool" },
    ],
  },
  yearly: {
    label: "Yearly figures", singular: "year", group: "Performance",
    help: "Shown on the Performance page only. The seeded numbers are illustrative; publish real figures only with approval.",
    columns: [["year", "Year"], ["productionTons", "Production (t)"], ["salesTons", "Sales (t)"], ["salesUsd", "Sales (US$)"]],
    fields: [
      { name: "year", label: "Year", kind: "int", required: true },
      { name: "productionTons", label: "Production (tons)", kind: "float" },
      { name: "salesTons", label: "Sales volume (tons)", kind: "float" },
      { name: "salesUsd", label: "Sales revenue (US$)", kind: "float" },
    ],
  },
  monthly: {
    label: "Monthly figures", singular: "month", group: "Performance",
    help: "Shown on the Performance page only. The seeded numbers are illustrative.",
    columns: [["year", "Year"], ["month", "Month"], ["productionTons", "Production (t)"], ["salesTons", "Sales (t)"], ["salesUsd", "Sales (US$)"]],
    fields: [
      { name: "year", label: "Year", kind: "int", required: true },
      { name: "month", label: "Month (1–12)", kind: "int", required: true },
      { name: "productionTons", label: "Production (tons)", kind: "float" },
      { name: "salesTons", label: "Sales volume (tons)", kind: "float" },
      { name: "salesUsd", label: "Sales revenue (US$)", kind: "float" },
    ],
  },
  markets: {
    label: "Markets", singular: "market", group: "Performance",
    help: "Share of sales by country, shown on the Performance page's Markets tab. The seeded numbers are illustrative.",
    columns: [["country", "Country"], ["sharePct", "Share (%)"]],
    fields: [
      { name: "country", label: "Country", required: true },
      { name: "sharePct", label: "Share of sales (%)", kind: "float" },
      { name: "note", label: "Note" },
      { name: "sort", label: "Display order", kind: "int" },
    ],
  },
} satisfies Record<string, SectionDef>;

export type SectionKey = keyof typeof SECTION_DEFS;

export function isSectionKey(key: string): key is SectionKey {
  return Object.hasOwn(SECTION_DEFS, key);
}
