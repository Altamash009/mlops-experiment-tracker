from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from models.database import Base


class Parameter(Base):
    __tablename__ = "parameters"

    parameter_id = Column(
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

    param_name = Column(
        String(100),
        nullable=False
    )

    param_value = Column(
        String(255),
        nullable=False
    )

    run = relationship(
        "Run",
        back_populates="parameters"
    )

    def __repr__(self):
        return f"<Parameter {self.param_name}>"