from sqlalchemy import Column, Integer, String, DateTime
from models.database import Base
from datetime import datetime


class Run(Base):
    __tablename__ = "runs"

    id = Column(Integer, primary_key=True, index=True)

    experiment_name = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="RUNNING"
    )

    start_time = Column(
        DateTime,
        default=datetime.utcnow
    )

    end_time = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )