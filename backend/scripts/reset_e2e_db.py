"""Reset dedicated Playwright E2E database.

Safety guard:
- Requires E2E_ALLOW_RESET=1 environment variable.
- Intended to run only from Playwright local/CI startup command.
"""

import os
import sys
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = CURRENT_DIR.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from main import create_app
from app import db


def _ensure_allowed() -> None:
    if os.getenv("E2E_ALLOW_RESET") != "1":
        raise RuntimeError("Refusing to reset DB: E2E_ALLOW_RESET must be '1'")


def _remove_sqlite_file_if_needed() -> None:
    database_url = os.getenv("DATABASE_URL", "")

    if not database_url.startswith("sqlite:///"):
        return

    sqlite_path = database_url.replace("sqlite:///", "", 1)
    path = Path(sqlite_path)

    if path.exists():
        path.unlink()

    path.parent.mkdir(parents=True, exist_ok=True)


def main() -> None:
    _ensure_allowed()
    _remove_sqlite_file_if_needed()

    app = create_app()

    with app.app_context():
        db.create_all()

    print("E2E database prepared.")


if __name__ == "__main__":
    main()
