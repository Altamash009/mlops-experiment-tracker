from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from models.database import Base


class Metric(Base):
    __tablename__ = "metrics"

    metric_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    run_id = Column(
        Integer,
        ForeignKey("runs.run_id"),
        nullable=False,
        index=True
    )

    metric_name = Column(
        String(100),
        nullable=False
    )

    metric_value = Column(
        Float,
        nullable=False
    )

    step = Column(
        Integer,
        default=0
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )

    run = relationship(
        "Run",
        back_populates="metrics"
    )

    def __repr__(self):
        return f"<Metric {self.metric_name}>"