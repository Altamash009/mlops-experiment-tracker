from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime
)

from sqlalchemy.orm import relationship

from datetime import datetime

from models.database import Base


class Artifact(Base):

    __tablename__ = "artifacts"

    id = Column(
        Integer,
        primary_key=True
    )

    run_id = Column(
        Integer,
        ForeignKey("runs.id"),
        nullable=False
    )

    file_name = Column(
        String,
        nullable=False
    )

    file_type = Column(
        String
    )

    storage_type = Column(
        String,
        default="LOCAL"
    )

    storage_uri = Column(
        String,
        nullable=False
    )

    artifact_version = Column(
        Integer,
        default=1
    )

    file_size = Column(
        Integer,
        nullable=True
    )

    checksum = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    run = relationship(
        "Run",
        back_populates="artifacts"
    )