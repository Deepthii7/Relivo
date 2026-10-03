from sqlalchemy import create_engine, event, inspect
from sqlalchemy.orm import declarative_base, sessionmaker

from config import BACKEND_DIR, DATABASE_URL


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 30} if DATABASE_URL.startswith("sqlite") else {},
)

if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def enable_sqlite_foreign_keys(connection, _record):
        connection.execute("PRAGMA foreign_keys=ON")


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def initialize_database():
    from models import auth_session, request, resource, user

    Base.metadata.create_all(bind=engine)
    if not DATABASE_URL.startswith("sqlite"):
        return
    columns = {column["name"] for column in inspect(engine).get_columns("resources")}
    additions = {
        "description": "TEXT NOT NULL DEFAULT ''",
        "condition": "VARCHAR NOT NULL DEFAULT 'Good'",
        "status": "VARCHAR NOT NULL DEFAULT 'Available'",
        "image_url": "VARCHAR",
        "initial_quantity": "INTEGER NOT NULL DEFAULT 0",
        "donor_id": "INTEGER REFERENCES users(id)",
        "created_at": "DATETIME",
    }
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in columns:
                connection.exec_driver_sql(f"ALTER TABLE resources ADD COLUMN {name} {definition}")
        connection.exec_driver_sql("UPDATE resources SET initial_quantity = quantity WHERE initial_quantity = 0")
        connection.exec_driver_sql("UPDATE resources SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL")