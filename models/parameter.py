from sqlalchemy import Column, Integer, String, ForeignKey
from models.database import Base


class Parameter(Base):
    __tablename__ = "parameters"

    id = Column(Integer, primary_key=True)

    run_id = Column(
        Integer,
        ForeignKey("runs.id"),
        nullable=False
    )

    param_name = Column(
        String,
        nullable=False
    )

    param_value = Column(
        String,
        nullable=False
    )