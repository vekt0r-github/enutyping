"""add replay table

Revision ID: aebac2ac1e13
Revises: 30c7bc5ec652
Create Date: 2023-05-14 23:33:18.016114

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'aebac2ac1e13'
down_revision = '30c7bc5ec652'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('replays',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('score_id', sa.String(length=69), nullable=True),
        sa.Column('data', sa.UnicodeText(), nullable=True),
        sa.ForeignKeyConstraint(['score_id'], ['scores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('replays')
    # ### end Alembic commands ###
