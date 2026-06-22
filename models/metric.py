from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from models.database import Base
from datetime import datetime
from sqlalchemy.orm import relationship

class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True)

    run_id = Column(
        Integer,
        ForeignKey("runs.id"),
        nullable=False
    )

    metric_name = Column(
        String,
        nullable=False
    )

    metric_value = Column(
        Float,
        nullable=False
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )

    run = relationship(
        "Run",
        back_populates="metrics"
    )