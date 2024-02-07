"""change map_mapset to many-to-many

Revision ID: dfbae521f2f5
Revises: 67fec9fbbc6b
Create Date: 2024-01-18 20:43:47.383071

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.schema import MetaData
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
# naming_convention = {
#   "ix": "ix_%(column_0_label)s",
#   "uq": "uq_%(table_name)s_%(column_0_name)s",
#   "ck": "ck_%(table_name)s_%(constraint_name)s",
#   "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
#   "pk": "pk_%(table_name)s"
# }

# revision identifiers, used by Alembic.
revision = 'dfbae521f2f5'
down_revision = '67fec9fbbc6b'
branch_labels = None
depends_on = None

class User(Base):
    __tablename__ = 'users'
    id = sa.Column(sa.String(69), primary_key=True)

class MapMapsetRelationship(Base):
    __tablename__ = 'map_mapset'
    id = sa.Column(sa.Integer, primary_key=True)
    beatmap_id = sa.Column(sa.Integer, sa.ForeignKey('beatmaps.id'), nullable=False)
    beatmapset_id = sa.Column(sa.Integer, sa.ForeignKey('beatmapsets.id'), nullable=False)

class Beatmapset(Base):
    __tablename__ = 'beatmapsets'
    id = sa.Column(sa.Integer, primary_key=True)
    owner_id = sa.Column(sa.String(69), sa.ForeignKey('users.id'))
    owner = sa.orm.relationship(User)

class Beatmap(Base):
    __tablename__ = 'beatmaps'
    id = sa.Column(sa.Integer, primary_key=True)
    beatmapset_id = sa.Column(sa.Integer, sa.ForeignKey('beatmapsets.id'))
    beatmapset = sa.orm.relationship(Beatmapset)
    beatmapsets = sa.orm.relationship('Beatmapset', secondary=MapMapsetRelationship.__table__)
    owner_id = sa.Column(sa.String(69), sa.ForeignKey('users.id'), nullable=True)
    owner = sa.orm.relationship(User)

def upgrade() -> None:    
    with op.batch_alter_table('beatmaps', schema=None) as batch_op:
        batch_op.add_column(sa.Column('owner_id', sa.VARCHAR(length=69), nullable=True))
        # batch_op.drop_constraint(batch_op.f('fk_beatmaps_beatmapset_id_beatmapsets'), type_='foreignkey')
        batch_op.create_foreign_key(batch_op.f('fk_beatmaps_owner_id_users'), 'users', ['owner_id'], ['id'])
    
    # data migration
    bind = op.get_bind()
    session = sa.orm.Session(bind=bind)
    MapMapsetRelationship.__table__.create(bind)
    map_mapset_rels = []
    for beatmap in session.query(Beatmap):
        beatmap.owner = beatmap.beatmapset.owner
        beatmap.beatmapsets.append(beatmap.beatmapset)
    session.commit()

    with op.batch_alter_table('beatmaps', schema=None) as batch_op:
        batch_op.alter_column('owner_id', nullable=False)
        batch_op.drop_column('beatmapset_id')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_unique_constraint(batch_op.f('uq_users_name'), ['name'])
    # ### end Alembic commands ###


def downgrade() -> None:
    ## NOTE: downgrading here will lose information about map ownership--
    ## potentially very bad if collections will be allowed to contain anyone's maps
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('beatmaps', sa.Column('beatmapset_id', sa.INTEGER(), nullable=True))
    op.drop_constraint(None, 'beatmaps', type_='foreignkey')
    op.create_foreign_key(None, 'beatmaps', 'beatmapsets', ['beatmapset_id'], ['id'])
    op.drop_column('beatmaps', 'owner_id')
    op.drop_table('map_mapset')
    # ### end Alembic commands ###
