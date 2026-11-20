# CMS Profile Site

Company website for **PT. Choyang Mopoli Samsung Chemical Indonesia** (PT. CMS Chem), with a built-in admin panel (CMS) for editing every piece of content without touching code.

- **Public site:** Home, About, Products (HI-LUB grades), Operations, Performance (charts), Markets, News, Partnership (inquiry form)
- **Admin panel:** `/admin`. Edit company details, products, figures, clients, news and more; read inquiries sent from the website.

Built with Python: **FastAPI** (web server), **Jinja** (HTML templates), **SQLAlchemy** (database). No JavaScript framework.

> **Sample content.** Production, sales, capacity, product specs and client names come from the company profile deck. Contact details, certifications, news posts and some history entries are **sample data**. Replace them in the admin panel, then turn off the sample notice under *Site settings → Site*.

---

## Run it on your computer

You need Python 3.12 or newer.

```bash
# 1. Get the code
git clone https://github.com/NaufalBasyah/cms-profile-site.git
cd cms-profile-site

# 2. Create an isolated Python environment and install packages
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3. Start the server (reloads automatically when you edit files)
uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000 for the site and http://127.0.0.1:8000/admin for the admin panel.

The first start creates a local database file (`cms.db`) and fills it with the content. Delete `cms.db` any time to start fresh.

**Default admin login:** username `admin`, password `change-me-now`. The dashboard warns you until you change it. To pick your own password from the start, set it before the first run:

```bash
ADMIN_PASSWORD="your-strong-password" uvicorn app.main:app --reload
```

## How the code is organised

```
app/
  main.py        Public pages (one function per page) and app setup
  admin.py       Admin panel. SECTIONS describes every editable content type
  models.py      Database tables
  seed.py        Content loaded on the very first run
  auth.py        Passwords, login sessions, form protection
  db.py          Database connection (SQLite locally, Postgres in production)
  templates/     HTML pages (admin pages in templates/admin/)
  static/        CSS, fonts, images, Chart.js
render.yaml      Deployment recipe for Render
```

To make a new kind of content editable: add a table in `models.py`, add an entry to `SECTIONS` in `admin.py`, and show it in a template.

## Live setup

The live site runs on **Render** (web service, Singapore) with its database on **Supabase** (Postgres, Singapore). Its tables are in a private `cms` schema that Supabase's public API cannot reach, and it connects with a dedicated `cms_app` login.

## Deploy to Render with a Render database

`render.yaml` sets up a web service and a Postgres database together.

1. In Render, choose **New → Blueprint** and pick this repository.
2. When asked, enter an `ADMIN_PASSWORD`. Render generates `SECRET_KEY` and connects `DATABASE_URL` automatically.
3. Every push to `main` redeploys the site.

Notes on the free plan: the web service sleeps after 15 minutes without visits (the first visit after that takes about a minute), and Render's free Postgres database expires after 30 days. Upgrade the database before relying on it.

## Environment variables

| Name | What it does | Default |
| --- | --- | --- |
| `DATABASE_URL` | Postgres connection string | SQLite file `cms.db` |
| `SECRET_KEY` | Signs login sessions. Use a long random value in production | Development value |
| `ADMIN_USERNAME` | First admin account's username (first run only) | `admin` |
| `ADMIN_PASSWORD` | First admin account's password (first run only) | `change-me-now` |
| `DB_SCHEMA` | Postgres schema for the site's tables (the live site uses `cms` on Supabase) | none |
| `HTTPS_ONLY` | `1` sends login cookies over HTTPS only | `0` |

See `.env.example`. Never commit real passwords.

## Credits

Archivo typeface by Omnibus-Type, SIL Open Font License (`app/static/fonts/OFL-LICENSE.txt`). Charts by Chart.js (MIT).
