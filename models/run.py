from sqlalchemy import Column, Integer, String, DateTime
from models.database import Base
from datetime import datetime
from sqlalchemy.orm import relationship
from models.parameter import Parameter
from models.metric import Metric
from models.artifact import Artifact


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

    parameters = relationship(
        "Parameter",
        back_populates="run",
        cascade="all, delete-orphan"
    )

    metrics = relationship(
        "Metric",
        back_populates="run",
        cascade="all, delete-orphan"
    )

    artifacts = relationship(
        "Artifact",
        back_populates="run",
        cascade="all, delete-orphan"
    )