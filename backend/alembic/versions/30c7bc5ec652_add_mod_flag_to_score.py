"""add mod_flag to score

Revision ID: 30c7bc5ec652
Revises: 7a94c86c868f
Create Date: 2023-05-14 13:23:20.988117

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '30c7bc5ec652'
down_revision = '7a94c86c868f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('scores',
        sa.Column('mod_flag',
            sa.Integer(),
            nullable=True,
            server_default="0",
        )
    )
    # ### end Alembic commands ###

# WARNING: this downgrade loses mod information!!!
def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('scores', 'mod_flag')
    # ### end Alembic commands ###
