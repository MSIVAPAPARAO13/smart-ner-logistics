from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, JSON, Text
from app.db.base import Base


class OptimizationRun(Base):
    __tablename__ = "optimization_runs"

    id = Column(String, primary_key=True, index=True)
    algorithm = Column(String, default="OR_TOOLS_CVRP_CONTEXT_AWARE")
    vehicle_count = Column(Integer, default=4)
    shipment_count = Column(Integer, default=4)
    total_distance_km = Column(Float, default=0.0)
    total_predicted_time_min = Column(Float, default=0.0)
    critical_on_time = Column(Integer, default=0)
    delayed_shipments = Column(Integer, default=0)
    unserved_shipments = Column(Integer, default=0)
    average_risk_score = Column(Float, default=0.0)
    vehicle_utilization_pct = Column(Float, default=0.0)
    assignments_json = Column(JSON, nullable=True)
    benchmark_comparison = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
