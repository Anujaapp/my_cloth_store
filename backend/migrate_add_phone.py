"""
migrate_add_phone.py
Run ONCE to add phone and is_verified columns to the users table.
Usage: python migrate_add_phone.py

Works with PostgreSQL (the project default) AND SQLite.
"""
import os
import database  # uses the same engine as the app

from sqlalchemy import text

def column_exists(conn, table, col):
    """Check if a column already exists in the table (works for both pg and sqlite)."""
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name=:t AND column_name=:c"
    ), {"t": table, "c": col})
    return result.fetchone() is not None

def run():
    with database.engine.connect() as conn:
        added = []

        if not column_exists(conn, "users", "phone"):
            conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR UNIQUE"))
            added.append("phone VARCHAR")

        if not column_exists(conn, "users", "is_verified"):
            conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))
            added.append("is_verified BOOLEAN")

        conn.commit()

    if added:
        print("[✓] Migration complete. Added columns:", ", ".join(added))
    else:
        print("[✓] Columns already exist. Nothing to do.")

if __name__ == "__main__":
    run()
