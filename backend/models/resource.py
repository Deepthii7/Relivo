from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from datetime import datetime

from database.connection import Base


class ResourceDB(Base):
    __tablename__ = "resources"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column("name", String, nullable=False)

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
    description = Column(Text, nullable=False, default="")
    condition = Column(String, nullable=False, default="Good")
    status = Column(String, nullable=False, default="Available")
    image_url = Column(String, nullable=True)
    initial_quantity = Column(Integer, nullable=False, default=0)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)