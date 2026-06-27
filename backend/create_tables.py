from models.database import engine, Base

from models.run import Run
from models.parameter import Parameter
from models.metric import Metric
from models.artifact import Artifact
from models.model_registry import ModelRegistry

Base.metadata.create_all(bind=engine)

print("All tables created successfully!")