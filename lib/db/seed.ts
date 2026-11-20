/**
 * First-run content.
 *
 * Product grades, applications, clients and company background come from the
 * company profile deck.
 *
 * PERFORMANCE FIGURES ARE ILLUSTRATIVE. The production, sales, revenue,
 * capacity and market-share numbers below are NOT the company's reported
 * results: they were scaled down to roughly a tenth and randomised so the
 * charts look realistic without disclosing real data. They appear only on the
 * Performance page, which carries a notice saying so. Replace them in the admin
 * panel (Performance → Yearly / Monthly / Markets) only with figures the
 * company has approved for publication.
 *
 * Items marked SAMPLE (contact details, certifications, news) are mockup content.
 */
import { sql } from "drizzle-orm";
import type { DB } from "./index";
import * as t from "./schema";
import { hashPassword } from "../auth/password";

type SettingRow = [key: string, label: string, group: string, kind: "text" | "textarea" | "bool", value: string];

export const SETTINGS: SettingRow[] = [
  ["company_name", "Company name", "Company", "text", "PT. Choyang Mopoli Samsung Chemical Indonesia"],
  ["short_name", "Short name", "Company", "text", "PT. CMS Chem Indonesia"],
  ["tagline", "Tagline", "Company", "text", "Ethylene bis stearamide from Sumatran palm oil"],
  ["founded", "Year founded", "Company", "text", "1999"],
  ["location", "Location", "Company", "text", "Medan, North Sumatra, Indonesia"],
  ["hero_title", "Home: headline", "Home page", "textarea",
    "Ethylene bis stearamide, made from Sumatran palm since 1999."],
  ["hero_intro", "Home: introduction", "Home page", "textarea",
    "We were Indonesia's first E.B.S. manufacturer. Our HI-LUB grades lubricate, release and disperse " +
    "in ABS, PVC, nylon and polyolefins for chemical companies across Asia."],
  ["about_intro", "About: introduction", "About page", "textarea",
    "PT. Choyang Mopoli Samsung Chemical Indonesia was founded in 1999 as a joint venture of Choyang " +
    "Fine Chemical Co., Ltd. (Korea), PT. Mopoli Raya (Indonesia) and Samsung Corporation (Korea). " +
    "The three partners gave the company its name and its strengths: Korean process know-how, local " +
    "palm-oil supply, and a global trading network."],
  ["facility_text", "About: facility", "About page", "textarea",
    "Our factory sits in a bonded zone in Medan and runs equipment supplied by experienced Korean " +
    "engineering companies. Capacity is being increased in stages. Raw material arrives from local " +
    "stearic acid producers, and three shifts a day keep the reactors running."],
  ["vision", "Vision", "About page", "textarea",
    "To be the partner of first choice for palm-based polymer additives in Asia."],
  ["mission", "Mission", "About page", "textarea",
    "Supply E.B.S. of consistent quality, on schedule, from responsibly sourced palm feedstock, " +
    "and grow with customers through technical support and long-term agreements."],
  ["partnership_intro", "Partnership: introduction", "Partnership page", "textarea",
    "We work with resin producers, compounders and distributors on supply agreements, toll " +
    "manufacturing and new grade development. Tell us what you need and our sales team will reply " +
    "within two working days."],
  // Performance page (illustrative)
  ["capacity_tons", "Annual capacity (tons)", "Performance page", "text", "6,000"],
  ["performance_intro", "Performance: introduction", "Performance page", "textarea",
    "Production, sales and markets in one place: annual figures, the current period month by month, " +
    "and where our sales go."],
  ["show_figures_notice", "Show the 'illustrative figures' notice on the Performance page", "Performance page", "bool", "1"],
  // SAMPLE contact details
  ["address", "Address", "Contact", "textarea",
    "Kawasan Industri Medan (KIM), Jl. Pulau Sumatra\nMedan 20242, North Sumatra, Indonesia"],
  ["phone", "Phone", "Contact", "text", "+62 61 6874 000"],
  ["email", "Sales email", "Contact", "text", "sales@cms-chem.example"],
  ["office_hours", "Office hours", "Contact", "text", "Monday to Friday, 08:00–17:00 WIB"],
  ["show_demo_notice", "Show the sample-content notice in the footer", "Site", "bool", "1"],
];

const PRODUCTS = [
  { name: "HI-LUB B50", grade: "B-50", physicalForm: "Bead", particleSize: "Min 90% pass 10 mesh",
    acidValue: "Max 10", amineValue: "Max 3", meltingPoint: "141–146 °C", color: "White to off-white",
    packing: "Paper bag 25 kg\nJumbo bag 500 / 600 / 1,200 kg",
    bestFor: "Dust-free dosing in masterbatch and compounding lines; ABS and PS internal lubrication.", sort: 1 },
  { name: "HI-LUB B80", grade: "B-80", physicalForm: "Bead", particleSize: "Min 90% pass 16 mesh",
    acidValue: "Max 10", amineValue: "Max 3", meltingPoint: "141–146 °C", color: "White to off-white",
    packing: "Paper bag 25 kg\nJumbo bag 500 / 600 / 1,200 kg",
    bestFor: "Finer beads for faster melt-in; rigid PVC, nylon and engineering plastics.", sort: 2 },
  { name: "HI-LUB P130", grade: "P-130", physicalForm: "Powder", particleSize: "Min 85% pass 140 mesh",
    acidValue: "Max 10", amineValue: "Max 3", meltingPoint: "141–146 °C", color: "White",
    packing: "Paper bag 20 kg",
    bestFor: "Dry blending with resin powders; release agent and pigment dispersant.", sort: 3 },
  { name: "HI-LUB P200", grade: "P-200", physicalForm: "Powder", particleSize: "Min 85% pass 200 mesh",
    acidValue: "Max 10", amineValue: "Max 3", meltingPoint: "141–146 °C", color: "White",
    packing: "Paper bag 20 kg",
    bestFor: "Finest grade for coatings, inks, paper coating and powder metallurgy.", sort: 4 },
];

const APPLICATIONS: [string, string][] = [
  ["Automotive", "Interior trim, dashboards and under-hood parts moulded in ABS, PP and nylon release cleanly and keep a smooth surface."],
  ["Electronics and appliances", "Housings for televisions, washing machines and small appliances flow better into thin-walled moulds."],
  ["Medical devices", "Consistent lubricity for precision-moulded components where surface finish matters."],
  ["3D printing", "Smoother extrusion of filament and better layer flow in ABS and PLA blends."],
  ["PVC pipe and profile", "Internal and external lubricant for rigid PVC, lowering power use during extrusion."],
  ["Masterbatch and pigments", "Pigment dispersant for faster blending and more uniform colour."],
  ["Rubber, asphalt and waxes", "Processing aid and anti-sticking agent in rubber, asphalt and wax blends."],
  ["Coatings, inks and paper", "Slip and anti-blocking in paint lacquer, enamel, ink and paper coating."],
  ["Ceramics, crayons and candles", "Binder and release aid for ceramics, pastels, coloured pencils and high-grade candles."],
];

// No figures here on purpose: numbers live only on the Performance page.
const MILESTONES: [string, string, string][] = [
  ["1999", "Company founded", "Joint venture of Choyang Fine Chemical, PT. Mopoli Raya and Samsung Corporation. Indonesia's first E.B.S. manufacturer."],
  ["2001", "First export shipment", "First containers of HI-LUB shipped to resin producers in South Korea and Taiwan."], // SAMPLE
  ["2006", "A decade of growth begins", "Sales grow year after year as Asian resin producers qualify HI-LUB grades."],
  ["2012", "Production milestone", "Annual production reaches a new high as export demand rises."],
  ["2021", "Record production", "The plant runs at its highest output to date."],
  ["2022", "Record sales", "Sales revenue reaches its highest level to date."],
  ["Today", "Expanding capacity", "Capacity is being increased in stages to keep pace with customers."],
];

const ADVANTAGES: [string, string][] = [
  ["Next to the raw material", "Medan sits at the centre of the world's largest palm-oil producing region, with large oleochemical capacity close by. Stearic acid supply is stable and easy to handle."],
  ["Thirty years of E.B.S. know-how", "Our Korean founding partner has produced E.B.S. for more than three decades. We were the first manufacturer in Indonesia and keep relationships with major chemical companies worldwide."],
  ["Round-the-clock production", "Competitive labour costs allow three shifts a working day, so we can hold lead times when demand rises."],
  ["Bonded-zone export", "Our bonded-zone facility simplifies customs for imported equipment and exported product."],
];

// ILLUSTRATIVE: scaled to about a tenth of the deck figures and randomised. Not reported results.
// [year, production tons, sales tons, sales US$]
const YEARLY: [number, number, number, number][] = [
  [2012, 2830, 2800, 3_717_000], [2013, 2980, 2940, 3_690_000], [2014, 3920, 3890, 4_513_000],
  [2015, 3730, 3740, 4_714_000], [2016, 3600, 3660, 5_077_000], [2017, 2620, 2670, 3_362_000],
  [2018, 3090, 3130, 3_725_000], [2019, 3450, 3490, 3_977_000], [2020, 3230, 3220, 3_903_000],
  [2021, 3560, 3530, 4_768_000], [2022, 4000, 3850, 4_979_000], [2023, 3210, 3160, 4_212_000],
  [2024, 3750, 3540, 5_108_000],
];

// ILLUSTRATIVE. month 1-12: [production tons, sales tons, sales US$]
const MONTHLY: Record<number, [number, number, number][]> = {
  2025: [[335, 377, 547_400], [282, 309, 415_400], [277, 231, 298_800], [311, 337, 489_000],
         [185, 154, 245_000], [150, 170, 234_700], [227, 224, 353_900], [316, 271, 374_900],
         [313, 301, 375_900], [246, 236, 325_700], [190, 174, 226_100], [72, 61, 76_900]],
  2026: [[167, 183, 256_100], [305, 346, 468_700], [244, 205, 262_500]],
};

// ILLUSTRATIVE share of sales by country (%).
const MARKETS: [string, number, string][] = [
  ["China", 44, "Largest market"], ["South Korea", 26, ""], ["Taiwan", 20, ""], ["Japan", 4, ""],
  ["Vietnam", 2, ""], ["Thailand", 1.5, ""], ["India", 1, ""], ["Malaysia", 1, ""], ["Other", 0.5, ""],
];

const CLIENTS: [string, string, string][] = [
  ["CHIMEI", "Taiwan", "ABS and styrenics"], ["LG Chem", "South Korea", "petrochemicals"],
  ["LG Chem (Huizhou)", "China", "petrochemicals"], ["CNOOC", "China", "petrochemicals"],
  ["Formosa Plastics", "Taiwan", "PVC and plastics"], ["Toray", "Japan", "engineering plastics"],
  ["INEOS Styrolution", "Global", "styrenics"], ["Lotte Chemical", "South Korea", "petrochemicals"],
  ["StarBetter", "China", "plastics"], ["Sinochem", "China", "chemicals"], ["Hincol", "Malaysia", "lubricants"],
];

const CERTIFICATIONS: [string, string, string][] = [ // SAMPLE
  ["ISO 9001:2015", "Quality management for the manufacture of ethylene bis stearamide.", "2004"],
  ["ISO 14001:2015", "Environmental management at the Medan plant.", "2011"],
  ["RSPO Supply Chain Certification", "Mass-balance sourcing of palm-based stearic acid.", "2018"],
  ["Halal certification", "HI-LUB grades certified for use in halal supply chains.", "2016"],
  ["REACH pre-registration", "Ethylene bis stearamide pre-registered for export to the EU.", "2010"],
];

const NEWS = [ // SAMPLE
  { slug: "capacity-expansion-phase-2", title: "Second-phase capacity expansion begins in Medan",
    category: "Company", publishedOn: "2026-09-15",
    summary: "A new reactor line will add capacity in stages over the coming years.",
    body: "Construction has started on the second phase of our capacity programme in Medan.\n\n" +
      "The new line uses the same Korean-supplied reactor design as our existing plant, so customers " +
      "receive identical product from both lines. Commissioning is planned in stages to keep " +
      "current deliveries on schedule.\n\nCustomers interested in reserving volume from the new line " +
      "can contact our sales team through the partnership page." },
  { slug: "hi-lub-p200-for-coatings", title: "HI-LUB P200 finds new use in powder coatings",
    category: "Product", publishedOn: "2026-06-02",
    summary: "Trials with coating formulators show P200 improves slip and anti-blocking at low dosage.",
    body: "Our finest powder grade, HI-LUB P200, has completed trials with two powder-coating formulators " +
      "in Southeast Asia.\n\nAt low dosage the grade improved surface slip and reduced blocking during " +
      "storage without affecting gloss. Technical data and samples are available on request." },
  { slug: "chinaplas-2026", title: "Meet us at Chinaplas 2026 in Shanghai",
    category: "Events", publishedOn: "2026-03-10",
    summary: "Our sales and technical team will be at the National Exhibition and Convention Center.",
    body: "We will be exhibiting at Chinaplas 2026 in Shanghai. Our team will be available to discuss " +
      "supply agreements, grade selection and technical support.\n\nTo book a meeting, send us a " +
      "message through the partnership page." },
  { slug: "rspo-supply-chain", title: "Renewed RSPO supply chain certification",
    category: "Sustainability", publishedOn: "2025-11-20",
    summary: "Our mass-balance certification has been renewed for another five-year term.",
    body: "Our RSPO supply chain certification has been renewed following an independent audit.\n\n" +
      "The certification covers the purchase of palm-based stearic acid and the production of " +
      "HI-LUB at our Medan plant." },
];

export async function seed(db: DB): Promise<void> {
  // Settings: add any keys that are missing (new settings appear after an upgrade).
  await db
    .insert(t.settings)
    .values(SETTINGS.map(([key, label, group, kind, value], sort) => ({ key, label, group, kind, value, sort })))
    .onConflictDoNothing({ target: t.settings.key });

  const [{ n: userCount }] = await db.select({ n: sql<number>`count(*)::int` }).from(t.users);
  if (userCount === 0) {
    await db.insert(t.users).values({
      username: process.env.ADMIN_USERNAME || "admin",
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD || "change-me-now"),
    }).onConflictDoNothing();
  }

  const [{ n: productCount }] = await db.select({ n: sql<number>`count(*)::int` }).from(t.products);
  if (productCount > 0) return; // content already seeded

  await db.insert(t.products).values(PRODUCTS);
  await db.insert(t.applications).values(APPLICATIONS.map(([name, description], sort) => ({ name, description, sort })));
  await db.insert(t.milestones).values(MILESTONES.map(([year, title, description], sort) => ({ year, title, description, sort })));
  await db.insert(t.advantages).values(ADVANTAGES.map(([title, description], sort) => ({ title, description, sort })));
  await db.insert(t.yearlyStats).values(
    YEARLY.map(([year, productionTons, salesTons, salesUsd]) => ({ year, productionTons, salesTons, salesUsd })),
  );
  await db.insert(t.monthlyStats).values(
    Object.entries(MONTHLY).flatMap(([year, rows]) =>
      rows.map(([productionTons, salesTons, salesUsd], i) => ({
        year: Number(year), month: i + 1, productionTons, salesTons, salesUsd,
      })),
    ),
  );
  await db.insert(t.markets).values(MARKETS.map(([country, sharePct, note], sort) => ({ country, sharePct, note, sort })));
  await db.insert(t.clients).values(CLIENTS.map(([name, country, sector], sort) => ({ name, country, sector, sort })));
  await db.insert(t.certifications).values(CERTIFICATIONS.map(([name, scope, since], sort) => ({ name, scope, since, sort })));
  await db.insert(t.news).values(NEWS);
}
