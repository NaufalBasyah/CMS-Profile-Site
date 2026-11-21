# CMS Profile Site

Company website for **PT. Choyang Mopoli Samsung Chemical Indonesia** (PT. CMS Chemical), with a built-in admin panel for editing every piece of content without touching code.

- **Public site:** Home, About, Products (HI-LUB grades), Operations, Performance, Markets, News, Partnership (inquiry form)
- **Admin panel:** `/admin`. Edit company details, products, history, clients, news and the Performance figures; read inquiries from the website.
- **Excel import and export:** every admin list except Site settings has *Export to Excel* and *Import from Excel*. The import page offers a template with the right columns, dropdowns and a "How to fill" sheet. Imports check every row first and save nothing if any row has a problem.

Built with **Next.js 16** (App Router, React 19, TypeScript), **Tailwind CSS v4**, **Base UI** components in the shadcn/ui style, **Motion**, **Recharts** and **Drizzle ORM** on Postgres (Supabase in production).

> **Illustrative figures.** Every production, sales, revenue, capacity and market-share number is on the **Performance** page only, and the seeded numbers are **not** the company's reported results: they were scaled down to about a tenth and randomised. The page shows a notice saying so (switch it off under *Site settings → Performance page* only once real, approved figures are entered).
>
> **Sample content.** Contact details, certifications, news posts and some history entries are also sample data. Replace them in the admin panel, then turn off the footer notice under *Site settings → Site*.

---

## Run it on your computer

You need Node.js 20.9 or newer (22 recommended).

```bash
# 1. Get the code
git clone https://github.com/NaufalBasyah/cms-profile-site.git
cd cms-profile-site

# 2. Install packages
npm install

# 3. Start the development server (reloads when you edit files)
npm run dev
```

Open http://localhost:3000 for the site and http://localhost:3000/admin for the admin panel.

No database setup is needed locally: the first start creates a small embedded Postgres in `.pglite/` and fills it with the content. Delete `.pglite/` any time to start fresh.

**Default admin login:** username `admin`, password `change-me-now`. The dashboard warns you until you change it.

Before pushing, check that everything compiles: `npm run lint` and `npm run build`.

## How the code is organised

```
app/
  (site)/            Public pages, one folder per URL (page.tsx)
  admin/             Admin panel: login, dashboard, settings, inquiries, content sections
  media/[id]/        Serves images uploaded in the admin panel
  globals.css        Brand colours, fonts and design tokens
components/
  ui/                Buttons, inputs, tabs, tables, sheet (Base UI, shadcn/ui style)
  site/              Header, footer and page building blocks
  performance/       Performance page tabs and charts
  motion/, effects/  Scroll reveal, animated numbers, hero background
  admin/             Admin forms and navigation
lib/
  db/                Tables (schema.ts, ddl.ts), connection (index.ts), first-run content (seed.ts)
  content.ts         Cached reads for the public site
  admin/             Admin sections (fields.ts), save/delete/import actions (actions.ts), Excel templates (excel.ts)
  auth/              Passwords and sign-in sessions
proxy.ts             Sends signed-out visitors from /admin to the login page
render.yaml          Deployment recipe for Render
```

To make a new kind of content editable: add a table in `lib/db/schema.ts` and `lib/db/ddl.ts`, add an entry in `lib/admin/fields.ts` and `lib/admin/sections.ts`, and show it on a page.

**How updates appear:** public pages are cached on the server. Every save in the admin panel clears that cache, so visitors see changes on their next page load.

## Deploy to Render with Supabase

1. In Supabase, open your project → **Connect** and copy a Postgres connection string (Session pooler works well with Render).
2. In Render choose **New → Blueprint** and pick this repository. Fill in `DATABASE_URL`, `ADMIN_PASSWORD` and `SITE_URL` when asked. Render generates `SECRET_KEY`.
3. On first start the site creates its tables in the `cms_next` schema and fills them with the content above. Every push to `main` redeploys.

**About the old Python site's data.** The previous version kept its tables in the `cms` schema. This version uses the same table and column names, and accepts the old admin password hashes, but **don't point `DB_SCHEMA` at `cms`** unless you want its content: that schema still holds the original, real production and sales figures, which would then appear on the Performance page. Use the fresh `cms_next` schema, and copy across only what you need (inquiries, for example).

On Render's free plan the service sleeps after 15 minutes without visits; the first visit after that takes about a minute.

## Environment variables

| Name | What it does | Default |
| --- | --- | --- |
| `DATABASE_URL` | Postgres connection string | Embedded local database in `.pglite/` |
| `DB_SCHEMA` | Postgres schema for the site's tables (keeps them away from Supabase's public API) | none (`public`) |
| `SECRET_KEY` | Signs admin sign-in cookies. Required in production | Development value |
| `ADMIN_USERNAME` | First admin account's username (only when no users exist) | `admin` |
| `ADMIN_PASSWORD` | First admin account's password (only when no users exist) | `change-me-now` |
| `SITE_URL` | The site's public address, for the sitemap and link previews | `http://localhost:3000` |

See `.env.example`. Never commit real passwords.

## Credits

Archivo typeface by Omnibus-Type, SIL Open Font License (`app/fonts/OFL-LICENSE.txt`). Components follow shadcn/ui conventions on Base UI (MIT); the scroll reveal and animated numbers are modelled on Motion Primitives and the hero background on Aceternity UI's Background Beams, written in this repo.
