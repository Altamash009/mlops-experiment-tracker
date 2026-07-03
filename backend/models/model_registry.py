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


class RegisteredModel(Base):
    __tablename__ = "registered_models"

    model_id = Column(
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

    model_name = Column(
        String(150),
        nullable=False
    )

    version = Column(
        Integer,
        nullable=False,
        default=1
    )

    stage = Column(
        String(30),
        nullable=False,
        default="Development"
    )

    description = Column(
        Text,
        nullable=True
    )

    registered_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    run = relationship(
        "Run",
        back_populates="registered_models"
    )

    def __repr__(self):
        return (
            f"<RegisteredModel("
            f"{self.model_name}, "
            f"v{self.version}, "
            f"{self.stage})>"
        )