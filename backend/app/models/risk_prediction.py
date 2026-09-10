from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from app.db.base import Base


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    road_id = Column(String, index=True, nullable=False)
    disruption_probability = Column(Float, nullable=False)  # 0.0 to 1.0
    risk_class = Column(String, default="LOW")  # LOW, WATCH, HIGH_RISK, CRITICAL
    predicted_delay_min = Column(Float, default=0.0)
    key_drivers = Column(JSON, default=list)  # List of string reasons
    model_version = Column(String, default="LGBM-v2.0-NER")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
