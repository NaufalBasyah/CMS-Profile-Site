"""Database setup.

Locally the site uses a SQLite file (cms.db). In production, set DATABASE_URL
to a Postgres connection string (Render and Railway provide one).
"""
import os

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker


def _database_url() -> str:
    url = os.getenv("DATABASE_URL", "sqlite:///./cms.db")
    # Hosting platforms often hand out "postgres://" URLs; SQLAlchemy wants
    # an explicit driver, and we use psycopg 3.
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


DATABASE_URL = _database_url()

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    pool_pre_ping=True,
)
# Optional: keep the site's tables in their own Postgres schema (used with Supabase,
# whose "public" schema is exposed through its web API).
DB_SCHEMA = os.getenv("DB_SCHEMA", "").strip()
if DB_SCHEMA and not DATABASE_URL.startswith("sqlite"):
    if not DB_SCHEMA.replace("_", "").isalnum():
        raise ValueError("DB_SCHEMA may only contain letters, numbers and underscores")

    @event.listens_for(engine, "connect")
    def _set_search_path(dbapi_conn, _record):
        with dbapi_conn.cursor() as cur:
            cur.execute(f'SET search_path TO "{DB_SCHEMA}"')
        dbapi_conn.commit()


SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
