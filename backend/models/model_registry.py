from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    UniqueConstraint
)

from sqlalchemy.orm import relationship

from models.database import Base

from datetime import datetime


class ModelRegistry(Base):

    __tablename__ = "model_registry"

    __table_args__ = (
        UniqueConstraint(
            "model_name",
            "version",
            name="unique_model_version"
        ),
    )

    id = Column(
        Integer,
        primary_key=True
    )

    model_name = Column(
        String,
        nullable=False
    )

    version = Column(
        String,
        nullable=False
    )

    run_id = Column(
        Integer,
        ForeignKey("runs.id")
    )

    stage = Column(
        String,
        default="Development"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    run = relationship(
        "Run"
    )