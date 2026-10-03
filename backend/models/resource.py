from sqlalchemy import Column, DateTime, Integer, String, Text

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

    description = Column(Text, nullable=True)
    condition = Column(String, nullable=True)
    donor_id = Column(Integer, nullable=True, index=True)
    donor_name = Column(String, nullable=True)
    donor_org = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)