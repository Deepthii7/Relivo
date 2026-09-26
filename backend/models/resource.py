from sqlalchemy import Column, Integer, String

from database.connection import Base


class ResourceDB(Base):
    __tablename__ = "resources"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    category = Column(
        String,
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    location = Column(
        String,
        nullable=False
    )