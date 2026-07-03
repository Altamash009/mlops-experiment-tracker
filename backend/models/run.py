from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from models.database import Base


class Run(Base):
    __tablename__ = "runs"

    run_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.project_id"),
        nullable=False,
        index=True
    )

    run_name = Column(
        String(150),
        nullable=False
    )

    status = Column(
        String(30),
        default="RUNNING",
        nullable=False
    )

    notes = Column(
        Text,
        nullable=True
    )

    start_time = Column(
        DateTime,
        default=datetime.utcnow
    )

    end_time = Column(
        DateTime,
        nullable=True
    )

    project = relationship(
        "Project",
        back_populates="runs"
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

    registered_models = relationship(
        "RegisteredModel",
        back_populates="run",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Run {self.run_name}>"