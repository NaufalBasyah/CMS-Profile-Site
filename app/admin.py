"""Admin panel (the CMS).

Each content type is described once in SECTIONS; the list, create, edit and delete
pages are generated from that description. To make a new table editable, add a
model in models.py and an entry here.
"""
from datetime import date

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import func, select
from starlette.datastructures import UploadFile
from sqlalchemy.orm import Session

from .auth import check_csrf, csrf_token, hash_password, require_user, verify_password
from .db import get_db
from .models import (
    Advantage, Application, Certification, Client, Inquiry, Market, Media, Milestone,
    MonthlyStat, NewsPost, Product, Setting, User, YearlyStat,
)

router = APIRouter(prefix="/admin")
templates = None  # set by main.py

MAX_UPLOAD = 3 * 1024 * 1024
IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def F(name, label, kind="text", help="", options=None, required=False):
    return dict(name=name, label=label, kind=kind, help=help, options=options or [], required=required)


SECTIONS = {
    "products": dict(
        model=Product, label="Products", singular="product", order=[Product.sort],
        columns=[("name", "Name"), ("physical_form", "Form"), ("particle_size", "Particle size"), ("is_active", "Shown")],
        fields=[
            F("name", "Product name", required=True), F("grade", "Grade", required=True),
            F("physical_form", "Physical form", "select", options=["Bead", "Powder", "Flake", "Pellet"]),
            F("particle_size", "Particle size"), F("acid_value", "Acid value"), F("amine_value", "Amine value"),
            F("melting_point", "Melting point"), F("color", "Colour"),
            F("packing", "Packing", "textarea", "One option per line."),
            F("best_for", "Best for", "textarea"), F("sort", "Display order", "int"),
            F("is_active", "Show on the website", "bool"),
        ]),
    "applications": dict(
        model=Application, label="Applications", singular="application", order=[Application.sort],
        columns=[("name", "Name"), ("description", "Description")],
        fields=[F("name", "Name", required=True), F("description", "Description", "textarea"),
                F("sort", "Display order", "int")]),
    "milestones": dict(
        model=Milestone, label="History", singular="milestone", order=[Milestone.sort],
        columns=[("year", "Year"), ("title", "Title")],
        fields=[F("year", "Year", required=True), F("title", "Title", required=True),
                F("description", "Description", "textarea"), F("sort", "Display order", "int")]),
    "advantages": dict(
        model=Advantage, label="Advantages", singular="advantage", order=[Advantage.sort],
        columns=[("title", "Title"), ("description", "Description")],
        fields=[F("title", "Title", required=True), F("description", "Description", "textarea"),
                F("sort", "Display order", "int")]),
    "yearly": dict(
        model=YearlyStat, label="Yearly figures", singular="year", order=[YearlyStat.year],
        columns=[("year", "Year"), ("production_tons", "Production (t)"), ("sales_tons", "Sales (t)"), ("sales_usd", "Sales (US$)")],
        fields=[F("year", "Year", "int", required=True), F("production_tons", "Production (tons)", "float"),
                F("sales_tons", "Sales volume (tons)", "float"), F("sales_usd", "Sales revenue (US$)", "float")]),
    "monthly": dict(
        model=MonthlyStat, label="Monthly figures", singular="month", order=[MonthlyStat.year.desc(), MonthlyStat.month],
        columns=[("year", "Year"), ("month", "Month"), ("production_tons", "Production (t)"), ("sales_tons", "Sales (t)"), ("sales_usd", "Sales (US$)")],
        fields=[F("year", "Year", "int", required=True), F("month", "Month (1–12)", "int", required=True),
                F("production_tons", "Production (tons)", "float"), F("sales_tons", "Sales volume (tons)", "float"),
                F("sales_usd", "Sales revenue (US$)", "float")]),
    "markets": dict(
        model=Market, label="Markets", singular="market", order=[Market.sort],
        columns=[("country", "Country"), ("share_pct", "Share (%)")],
        fields=[F("country", "Country", required=True), F("share_pct", "Share of sales (%)", "float"),
                F("note", "Note"), F("sort", "Display order", "int")]),
    "clients": dict(
        model=Client, label="Clients", singular="client", order=[Client.sort],
        columns=[("name", "Name"), ("country", "Country"), ("sector", "Sector")],
        fields=[F("name", "Name", required=True), F("country", "Country"), F("sector", "Sector"),
                F("sort", "Display order", "int")]),
    "certifications": dict(
        model=Certification, label="Certifications", singular="certification", order=[Certification.sort],
        columns=[("name", "Name"), ("since", "Since")],
        fields=[F("name", "Name", required=True), F("scope", "Scope", "textarea"), F("since", "Held since"),
                F("sort", "Display order", "int")]),
    "news": dict(
        model=NewsPost, label="News", singular="news post", order=[NewsPost.published_on.desc()],
        columns=[("title", "Title"), ("category", "Category"), ("published_on", "Date"), ("is_published", "Published")],
        fields=[F("title", "Title", required=True),
                F("slug", "Web address", help="Lowercase words joined by hyphens, e.g. new-reactor-line.", required=True),
                F("category", "Category", "select", options=["Company", "Product", "Events", "Sustainability"]),
                F("published_on", "Date", "date"), F("summary", "Summary", "textarea"),
                F("body", "Article", "textarea", "Leave a blank line between paragraphs."),
                F("image_url", "Image", "image"), F("is_published", "Published", "bool")]),
}


def page(request: Request, name: str, **ctx):
    ctx.setdefault("sections", SECTIONS)
    ctx.setdefault("csrf", csrf_token(request))
    ctx.setdefault("user", request.session.get("user"))
    ctx.setdefault("flash", request.session.pop("flash", None))
    return templates.TemplateResponse(request, f"admin/{name}", ctx)


def flash(request: Request, message: str):
    request.session["flash"] = message


# ---------- login ----------

@router.get("/login")
def login_form(request: Request, next: str = "/admin"):
    return page(request, "login.html", next=next, error=None)


@router.post("/login")
def login(request: Request, username: str = Form(""), password: str = Form(""),
          next: str = Form("/admin"), csrf: str = Form(""), db: Session = Depends(get_db)):
    check_csrf(request, csrf)
    user = db.scalar(select(User).where(User.username == username.strip()))
    if not user or not verify_password(password, user.password_hash):
        return page(request, "login.html", next=next, error="That username and password don't match.")
    request.session["user"] = user.username
    return RedirectResponse(next if next.startswith("/admin") else "/admin", status_code=303)


@router.post("/logout")
def logout(request: Request, csrf: str = Form("")):
    check_csrf(request, csrf)
    request.session.clear()
    return RedirectResponse("/admin/login", status_code=303)


# ---------- dashboard ----------

@router.get("")
def dashboard(request: Request, user: str = Depends(require_user), db: Session = Depends(get_db)):
    counts = {key: db.scalar(select(func.count()).select_from(sec["model"])) for key, sec in SECTIONS.items()}
    new_inquiries = db.scalar(select(func.count()).select_from(Inquiry).where(Inquiry.status == "New"))
    recent = db.scalars(select(Inquiry).order_by(Inquiry.created_at.desc()).limit(5)).all()
    me = db.scalar(select(User).where(User.username == user))
    default_password = bool(me and verify_password("change-me-now", me.password_hash))
    return page(request, "dashboard.html", counts=counts, new_inquiries=new_inquiries,
                recent=recent, default_password=default_password)


# ---------- settings ----------

@router.get("/settings")
def settings_form(request: Request, _: str = Depends(require_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(Setting).order_by(Setting.sort)).all()
    groups: dict[str, list] = {}
    for r in rows:
        groups.setdefault(r.group, []).append(r)
    return page(request, "settings.html", groups=groups)


@router.post("/settings")
async def settings_save(request: Request, _: str = Depends(require_user), db: Session = Depends(get_db)):
    form = await request.form()
    check_csrf(request, form.get("csrf"))
    for row in db.scalars(select(Setting)):
        if row.kind == "bool":
            row.value = "1" if form.get(row.key) else "0"
        elif row.key in form:
            row.value = str(form[row.key]).strip()
    db.commit()
    flash(request, "Site settings saved.")
    return RedirectResponse("/admin/settings", status_code=303)


# ---------- inquiries ----------

@router.get("/inquiries")
def inquiries(request: Request, _: str = Depends(require_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(Inquiry).order_by(Inquiry.created_at.desc())).all()
    return page(request, "inquiries.html", rows=rows)


@router.get("/inquiries/{item_id}")
def inquiry(item_id: int, request: Request, _: str = Depends(require_user), db: Session = Depends(get_db)):
    item = db.get(Inquiry, item_id) or _missing()
    return page(request, "inquiry.html", item=item)


@router.post("/inquiries/{item_id}")
def inquiry_status(item_id: int, request: Request, status: str = Form(...), csrf: str = Form(""),
                   _: str = Depends(require_user), db: Session = Depends(get_db)):
    check_csrf(request, csrf)
    item = db.get(Inquiry, item_id) or _missing()
    if status in {"New", "Replied", "Closed"}:
        item.status = status
        db.commit()
        flash(request, f"Inquiry marked as {status.lower()}.")
    return RedirectResponse(f"/admin/inquiries/{item_id}", status_code=303)


@router.post("/inquiries/{item_id}/delete")
def inquiry_delete(item_id: int, request: Request, csrf: str = Form(""),
                   _: str = Depends(require_user), db: Session = Depends(get_db)):
    check_csrf(request, csrf)
    item = db.get(Inquiry, item_id) or _missing()
    db.delete(item)
    db.commit()
    flash(request, "Inquiry deleted.")
    return RedirectResponse("/admin/inquiries", status_code=303)


# ---------- account ----------

@router.get("/account")
def account(request: Request, _: str = Depends(require_user)):
    return page(request, "account.html", error=None)


@router.post("/account")
def account_save(request: Request, current: str = Form(""), new: str = Form(""), confirm: str = Form(""),
                 csrf: str = Form(""), user: str = Depends(require_user), db: Session = Depends(get_db)):
    check_csrf(request, csrf)
    me = db.scalar(select(User).where(User.username == user))
    error = None
    if not me or not verify_password(current, me.password_hash):
        error = "Your current password is incorrect."
    elif len(new) < 10:
        error = "Use at least 10 characters for the new password."
    elif new != confirm:
        error = "The new passwords don't match."
    if error:
        return page(request, "account.html", error=error)
    me.password_hash = hash_password(new)
    db.commit()
    flash(request, "Password changed.")
    return RedirectResponse("/admin", status_code=303)


# ---------- generic content sections ----------

def _section(key: str) -> dict:
    sec = SECTIONS.get(key)
    if not sec:
        raise HTTPException(404)
    return sec


def _missing():
    raise HTTPException(404)


@router.get("/{key}")
def item_list(key: str, request: Request, _: str = Depends(require_user), db: Session = Depends(get_db)):
    sec = _section(key)
    rows = db.scalars(select(sec["model"]).order_by(*sec["order"])).all()
    return page(request, "list.html", key=key, sec=sec, rows=rows)


@router.get("/{key}/new")
def item_new(key: str, request: Request, _: str = Depends(require_user)):
    sec = _section(key)
    return page(request, "form.html", key=key, sec=sec, item=None, values={}, errors={})


@router.get("/{key}/{item_id}")
def item_edit(key: str, item_id: int, request: Request, _: str = Depends(require_user), db: Session = Depends(get_db)):
    sec = _section(key)
    item = db.get(sec["model"], item_id) or _missing()
    values = {f["name"]: getattr(item, f["name"]) for f in sec["fields"]}
    return page(request, "form.html", key=key, sec=sec, item=item, values=values, errors={})


async def _parse(sec: dict, form, db: Session) -> tuple[dict, dict]:
    values, errors = {}, {}
    for f in sec["fields"]:
        name, kind = f["name"], f["kind"]
        raw = form.get(name)
        if kind == "bool":
            values[name] = bool(raw)
            continue
        if kind == "image":
            values[name] = (form.get(f"{name}__current") or "").strip()
            upload = form.get(f"{name}__file")
            if isinstance(upload, UploadFile) and upload.filename:
                data = await upload.read()
                if upload.content_type not in IMAGE_TYPES:
                    errors[name] = "Upload a JPG, PNG, WebP or GIF image."
                elif len(data) > MAX_UPLOAD:
                    errors[name] = "Use an image smaller than 3 MB."
                else:
                    m = Media(filename=upload.filename[:200], content_type=upload.content_type, data=data)
                    db.add(m)
                    db.flush()
                    values[name] = f"/media/{m.id}"
            if form.get(f"{name}__remove"):
                values[name] = ""
            continue
        raw = (raw or "").strip() if isinstance(raw, str) else ""
        if f["required"] and not raw:
            errors[name] = f"Enter the {f['label'].lower()}."
            continue
        try:
            if kind == "int":
                values[name] = int(raw) if raw else 0
            elif kind == "float":
                values[name] = float(raw.replace(",", "")) if raw else 0.0
            elif kind == "date":
                values[name] = date.fromisoformat(raw) if raw else date.today()
            else:
                values[name] = raw
        except ValueError:
            errors[name] = "Enter a number." if kind in ("int", "float") else "Enter a date like 2026-11-20."
            values[name] = raw
    return values, errors


@router.post("/{key}/new")
async def item_create(key: str, request: Request, _: str = Depends(require_user), db: Session = Depends(get_db)):
    sec = _section(key)
    form = await request.form()
    check_csrf(request, form.get("csrf"))
    values, errors = await _parse(sec, form, db)
    if errors:
        db.rollback()
        return page(request, "form.html", key=key, sec=sec, item=None, values=values, errors=errors)
    db.add(sec["model"](**values))
    db.commit()
    flash(request, f"{sec['singular'].capitalize()} added.")
    return RedirectResponse(f"/admin/{key}", status_code=303)


@router.post("/{key}/{item_id}")
async def item_update(key: str, item_id: int, request: Request, _: str = Depends(require_user), db: Session = Depends(get_db)):
    sec = _section(key)
    item = db.get(sec["model"], item_id) or _missing()
    form = await request.form()
    check_csrf(request, form.get("csrf"))
    values, errors = await _parse(sec, form, db)
    if errors:
        db.rollback()
        return page(request, "form.html", key=key, sec=sec, item=item, values=values, errors=errors)
    for k, v in values.items():
        setattr(item, k, v)
    db.commit()
    flash(request, f"{sec['singular'].capitalize()} saved.")
    return RedirectResponse(f"/admin/{key}", status_code=303)


@router.post("/{key}/{item_id}/delete")
def item_delete(key: str, item_id: int, request: Request, csrf: str = Form(""),
                _: str = Depends(require_user), db: Session = Depends(get_db)):
    check_csrf(request, csrf)
    sec = _section(key)
    item = db.get(sec["model"], item_id) or _missing()
    db.delete(item)
    db.commit()
    flash(request, f"{sec['singular'].capitalize()} deleted.")
    return RedirectResponse(f"/admin/{key}", status_code=303)
