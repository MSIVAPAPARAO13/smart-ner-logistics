from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, JSON, Boolean
from app.db.base import Base


class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(String, primary_key=True, index=True)
    model_name = Column(String, nullable=False, index=True)
    version = Column(String, nullable=False)
    model_type = Column(String, nullable=False)  # GNN_RRNCO_ROUTER, LIGHTGBM_REGRESSOR, LIGHTGBM_CLASSIFIER
    training_dataset = Column(String, default="NER_CORRIDOR_GRAPH_V1")
    feature_schema = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
