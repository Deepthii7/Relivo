from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database.connection import Base


class RequestDB(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False, index=True)
    recipient_id = Column(Integer, nullable=False, index=True)
    recipient_name = Column(String, nullable=False)
    recipient_org = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    urgency = Column(String, nullable=False, default="normal")
    base_priority = Column(Integer, nullable=False, default=50)
    status = Column(String, nullable=False, default="Pending", index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    resource = relationship("ResourceDB")