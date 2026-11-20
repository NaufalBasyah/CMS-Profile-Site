"""Public website routes and app setup."""
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, Form, HTTPException, Request
from fastapi.responses import RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from . import admin
from .auth import LoginRequired, csrf_token
from .db import Base, SessionLocal, engine, get_db
from .models import (
    Advantage, Application, Certification, Client, Inquiry, Market, Media, Milestone,
    MonthlyStat, NewsPost, Product, Setting, YearlyStat,
)
from .seed import seed

BASE_DIR = Path(__file__).parent


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "dev-only-secret-change-me"),
    same_site="lax",
    https_only=os.getenv("HTTPS_ONLY", "0") == "1",
)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

templates = Jinja2Templates(directory=BASE_DIR / "templates")
admin.templates = templates


def _num(value, digits=0):
    try:
        return f"{float(value):,.{digits}f}"
    except (TypeError, ValueError):
        return value


def _paragraphs(text):
    return [p.strip() for p in (text or "").split("\n\n") if p.strip()]


templates.env.filters["num"] = _num
templates.env.filters["paragraphs"] = _paragraphs
app.include_router(admin.router)

NAV = [
    ("/about", "About"),
    ("/products", "Products"),
    ("/operations", "Operations"),
    ("/performance", "Performance"),
    ("/markets", "Markets"),
    ("/news", "News"),
]
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@app.exception_handler(LoginRequired)
async def _login_redirect(request: Request, _exc: LoginRequired):
    return RedirectResponse(f"/admin/login?next={request.url.path}", status_code=303)


def settings(db: Session) -> dict:
    return {s.key: s.value for s in db.scalars(select(Setting))}


def render(request: Request, db: Session, name: str, **ctx):
    ctx.update(s=settings(db), nav=NAV, path=request.url.path)
    return templates.TemplateResponse(request, name, ctx)


def ordered(db: Session, model, *order):
    return db.scalars(select(model).order_by(*order)).all()


@app.get("/")
def home(request: Request, db: Session = Depends(get_db)):
    years = ordered(db, YearlyStat, YearlyStat.year)
    latest = years[-1] if years else None
    return render(
        request, db, "home.html",
        products=ordered(db, Product, Product.sort),
        advantages=ordered(db, Advantage, Advantage.sort),
        clients=ordered(db, Client, Client.sort),
        news=db.scalars(select(NewsPost).where(NewsPost.is_published).order_by(NewsPost.published_on.desc()).limit(3)).all(),
        latest=latest,
        peak_production=max((y.production_tons for y in years), default=0),
    )


@app.get("/about")
def about(request: Request, db: Session = Depends(get_db)):
    return render(
        request, db, "about.html",
        milestones=ordered(db, Milestone, Milestone.sort),
        certifications=ordered(db, Certification, Certification.sort),
    )


@app.get("/products")
def products(request: Request, db: Session = Depends(get_db)):
    return render(
        request, db, "products.html",
        products=db.scalars(select(Product).where(Product.is_active).order_by(Product.sort)).all(),
        applications=ordered(db, Application, Application.sort),
    )


@app.get("/operations")
def operations(request: Request, db: Session = Depends(get_db)):
    return render(request, db, "operations.html", advantages=ordered(db, Advantage, Advantage.sort))


@app.get("/performance")
def performance(request: Request, db: Session = Depends(get_db)):
    years = ordered(db, YearlyStat, YearlyStat.year)
    monthly = ordered(db, MonthlyStat, MonthlyStat.year, MonthlyStat.month)
    by_year: dict[int, list] = {}
    for m in monthly:
        by_year.setdefault(m.year, [None] * 12)[m.month - 1] = m
    chart = {
        "years": [y.year for y in years],
        "production": [y.production_tons for y in years],
        "salesTons": [y.sales_tons for y in years],
        "salesUsd": [round(y.sales_usd / 1e6, 1) for y in years],
        "months": MONTHS,
        "monthly": {
            str(year): {
                "production": [r.production_tons if r else None for r in rows],
                "salesTons": [r.sales_tons if r else None for r in rows],
            }
            for year, rows in by_year.items()
        },
    }
    totals = {
        year: {
            "production": sum(r.production_tons for r in rows if r),
            "sales_tons": sum(r.sales_tons for r in rows if r),
            "sales_usd": sum(r.sales_usd for r in rows if r),
            "months": sum(1 for r in rows if r),
        }
        for year, rows in by_year.items()
    }
    return render(request, db, "performance.html", years=years, chart=chart, totals=totals, months=MONTHS)


@app.get("/markets")
def markets(request: Request, db: Session = Depends(get_db)):
    return render(
        request, db, "markets.html",
        markets=ordered(db, Market, Market.sort),
        clients=ordered(db, Client, Client.sort),
    )


@app.get("/news")
def news(request: Request, db: Session = Depends(get_db)):
    posts = db.scalars(select(NewsPost).where(NewsPost.is_published).order_by(NewsPost.published_on.desc())).all()
    return render(request, db, "news.html", posts=posts)


@app.get("/news/{slug}")
def news_post(slug: str, request: Request, db: Session = Depends(get_db)):
    post = db.scalar(select(NewsPost).where(NewsPost.slug == slug, NewsPost.is_published))
    if not post:
        raise HTTPException(404)
    return render(request, db, "news_post.html", post=post)


@app.get("/partnership")
def partnership(request: Request, sent: int = 0, db: Session = Depends(get_db)):
    return render(
        request, db, "partnership.html",
        products=db.scalars(select(Product).where(Product.is_active).order_by(Product.sort)).all(),
        sent=bool(sent), errors={}, form={}, csrf=csrf_token(request),
    )


@app.post("/partnership")
def partnership_submit(
    request: Request,
    name: str = Form(""), company: str = Form(""), email: str = Form(""), country: str = Form(""),
    interest: str = Form(""), grade: str = Form(""), volume: str = Form(""), message: str = Form(""),
    website: str = Form(""),  # honeypot: real visitors never see this field
    csrf: str = Form(""),
    db: Session = Depends(get_db),
):
    form = dict(name=name.strip(), company=company.strip(), email=email.strip(), country=country.strip(),
                interest=interest, grade=grade, volume=volume.strip(), message=message.strip())
    if website:
        return RedirectResponse("/partnership?sent=1", status_code=303)
    errors = {}
    if not form["name"]:
        errors["name"] = "Enter your name."
    if not form["company"]:
        errors["company"] = "Enter your company name."
    if "@" not in form["email"] or "." not in form["email"].split("@")[-1]:
        errors["email"] = "Enter an email address like name@company.com."
    if csrf != request.session.get("csrf"):
        errors["form"] = "This form expired. Check your details and send it again."
    if errors:
        return render(
            request, db, "partnership.html",
            products=ordered(db, Product, Product.sort), sent=False,
            errors=errors, form=form, csrf=csrf_token(request),
        )
    db.add(Inquiry(**{k: v[:2000] for k, v in form.items()}))
    db.commit()
    return RedirectResponse("/partnership?sent=1", status_code=303)


@app.get("/media/{media_id}")
def media(media_id: int, db: Session = Depends(get_db)):
    item = db.get(Media, media_id)
    if not item:
        raise HTTPException(404)
    return Response(item.data, media_type=item.content_type,
                    headers={"Cache-Control": "public, max-age=86400"})


@app.get("/healthz")
def healthz():
    return {"ok": True}


@app.exception_handler(404)
async def not_found(request: Request, _exc):
    with SessionLocal() as db:
        resp = render(request, db, "404.html")
    resp.status_code = 404
    return resp
