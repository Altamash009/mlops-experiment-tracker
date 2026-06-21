from sqlalchemy import Column, Integer, String, ForeignKey
from models.database import Base


class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(Integer, primary_key=True)

    run_id = Column(
        Integer,
        ForeignKey("runs.id"),
        nullable=False
    )

    file_name = Column(
        String,
        nullable=False
    )

    file_path = Column(
        String,
        nullable=False
    )

    file_type = Column(
        String,
        nullable=True
    )