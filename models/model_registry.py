from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from models.database import Base
from datetime import datetime
from sqlalchemy.orm import relationship


class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True)

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

    run = relationship(
        "Run"
    )

    stage = Column(
        String,
        default="Development"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )