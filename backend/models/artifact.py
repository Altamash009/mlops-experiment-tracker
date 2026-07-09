from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    BigInteger,
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

    artifact_name = Column(
        String(255),
        nullable=False
    )

    artifact_type = Column(
        String(50),
        nullable=False,
        default="other"
    )

    description = Column(
        String(500),
        nullable=True
    )

    storage_path = Column(
        String(500),
        nullable=False
    )

    file_size = Column(
        BigInteger,
        nullable=False
    )

    checksum = Column(
        String(128),
        nullable=False
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    run = relationship(
        "Run",
        back_populates="artifacts"
    )

    def __repr__(self):

        return f"<Artifact {self.artifact_name}>"