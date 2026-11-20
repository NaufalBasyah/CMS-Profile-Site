"""Content models. Every table here is editable from the admin panel."""
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, LargeBinary, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))


class Setting(Base):
    """Single values used across the site: company name, contact details, page intros."""
    __tablename__ = "settings"
    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(80), unique=True)
    label: Mapped[str] = mapped_column(String(120))
    group: Mapped[str] = mapped_column(String(60), default="General")
    kind: Mapped[str] = mapped_column(String(20), default="text")  # text | textarea | bool
    value: Mapped[str] = mapped_column(Text, default="")
    sort: Mapped[int] = mapped_column(Integer, default=0)


class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    grade: Mapped[str] = mapped_column(String(40))
    physical_form: Mapped[str] = mapped_column(String(40))
    particle_size: Mapped[str] = mapped_column(String(120))
    acid_value: Mapped[str] = mapped_column(String(40))
    amine_value: Mapped[str] = mapped_column(String(40))
    melting_point: Mapped[str] = mapped_column(String(40), default="")
    color: Mapped[str] = mapped_column(String(60), default="")
    packing: Mapped[str] = mapped_column(Text)
    best_for: Mapped[str] = mapped_column(Text, default="")
    sort: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Application(Base):
    __tablename__ = "applications"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    sort: Mapped[int] = mapped_column(Integer, default=0)


class Milestone(Base):
    __tablename__ = "milestones"
    id: Mapped[int] = mapped_column(primary_key=True)
    year: Mapped[str] = mapped_column(String(10))
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text, default="")
    sort: Mapped[int] = mapped_column(Integer, default=0)


class Advantage(Base):
    __tablename__ = "advantages"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    sort: Mapped[int] = mapped_column(Integer, default=0)


class YearlyStat(Base):
    __tablename__ = "yearly_stats"
    id: Mapped[int] = mapped_column(primary_key=True)
    year: Mapped[int] = mapped_column(Integer, unique=True)
    production_tons: Mapped[float] = mapped_column(Float, default=0)
    sales_tons: Mapped[float] = mapped_column(Float, default=0)
    sales_usd: Mapped[float] = mapped_column(Float, default=0)


class MonthlyStat(Base):
    __tablename__ = "monthly_stats"
    id: Mapped[int] = mapped_column(primary_key=True)
    year: Mapped[int] = mapped_column(Integer)
    month: Mapped[int] = mapped_column(Integer)
    production_tons: Mapped[float] = mapped_column(Float, default=0)
    sales_tons: Mapped[float] = mapped_column(Float, default=0)
    sales_usd: Mapped[float] = mapped_column(Float, default=0)


class Market(Base):
    __tablename__ = "markets"
    id: Mapped[int] = mapped_column(primary_key=True)
    country: Mapped[str] = mapped_column(String(80))
    share_pct: Mapped[float] = mapped_column(Float, default=0)
    note: Mapped[str] = mapped_column(String(200), default="")
    sort: Mapped[int] = mapped_column(Integer, default=0)


class Client(Base):
    __tablename__ = "clients"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    country: Mapped[str] = mapped_column(String(80), default="")
    sector: Mapped[str] = mapped_column(String(120), default="")
    sort: Mapped[int] = mapped_column(Integer, default=0)


class Certification(Base):
    __tablename__ = "certifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    scope: Mapped[str] = mapped_column(Text, default="")
    since: Mapped[str] = mapped_column(String(20), default="")
    sort: Mapped[int] = mapped_column(Integer, default=0)


class NewsPost(Base):
    __tablename__ = "news"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(60), default="Company")
    published_on: Mapped[date] = mapped_column(Date, default=date.today)
    summary: Mapped[str] = mapped_column(Text, default="")
    body: Mapped[str] = mapped_column(Text, default="")
    image_url: Mapped[str] = mapped_column(String(300), default="")
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)


class Inquiry(Base):
    """Messages sent from the partnership form on the public site."""
    __tablename__ = "inquiries"
    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    name: Mapped[str] = mapped_column(String(120))
    company: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(160))
    country: Mapped[str] = mapped_column(String(80), default="")
    interest: Mapped[str] = mapped_column(String(80), default="")
    grade: Mapped[str] = mapped_column(String(40), default="")
    volume: Mapped[str] = mapped_column(String(80), default="")
    message: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="New")


class Media(Base):
    """Uploaded images, stored in the database so they survive redeploys."""
    __tablename__ = "media"
    id: Mapped[int] = mapped_column(primary_key=True)
    filename: Mapped[str] = mapped_column(String(200))
    content_type: Mapped[str] = mapped_column(String(80))
    data: Mapped[bytes] = mapped_column(LargeBinary)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
