"""Initial schema baseline

Revision ID: 001
Revises: 
Create Date: 2026-04-21 15:20:00.000000

This baseline revision intentionally performs no DDL because the project's
existing app bootstrap currently creates tables via SQLAlchemy metadata.
It exists to provide a valid Alembic lineage so later revisions (e.g. 002)
can execute without KeyError for missing down_revision.
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Baseline revision: no-op."""
    pass


def downgrade():
    """Baseline revision: no-op."""
    pass
