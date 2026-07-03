from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from models.database import Base


class Artifact(Base):
    __tablename__ = "artifacts"

    artifact_id = Column(
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

    file_name = Column(
        String(255),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=False
    )

    checksum = Column(
        String(128),
        nullable=False
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    run = relationship(
        "Run",
        back_populates="artifacts"
    )

    def __repr__(self):
        return f"<Artifact {self.file_name}>"