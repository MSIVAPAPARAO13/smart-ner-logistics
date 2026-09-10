import logging
import numpy as np
from typing import Dict, Any, List, Tuple
from lightgbm import LGBMClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score
from app.services.feature_service import feature_service

logger = logging.getLogger("sih26002.disruption_ml")


class DisruptionRiskPredictor:
    """
    LightGBM Classifier for application-level road disruption risk probability.
    Predicts flash flood / landslide blockage vulnerability from environmental and topological features.
    """

    def __init__(self):
        self.model: Optional[LGBMClassifier] = None
        self.accuracy: float = 0.0
        self.f1: float = 0.0
        self.model_name: str = "LGBM-RISK-v2.0-NER"
        self._train_initial_model()

    def _generate_synthetic_ner_disruption_dataset(self, n_samples: int = 1500) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generates grounded training samples for NER landslide/flood disruptions.
        Features: [rainfall_mm, precip_prob, soil_moisture, slope_deg, traffic, bridge_closed, terrain, road_type]
        """
        np.random.seed(42)
        rainfall = np.random.exponential(scale=24.0, size=n_samples)
        precip_prob = np.random.uniform(10.0, 100.0, n_samples)
        soil_moisture = np.random.uniform(0.18, 0.70, n_samples)
        slope = np.random.uniform(2.0, 28.0, n_samples)
        traffic = np.random.choice([0, 1, 2, 3], n_samples, p=[0.4, 0.3, 0.2, 0.1])
        bridge_closed = np.random.choice([0, 1], n_samples, p=[0.92, 0.08])
        terrain = np.random.choice([0, 1, 2, 3], n_samples, p=[0.2, 0.2, 0.5, 0.1])
        road_type = np.random.choice([0, 1, 2], n_samples, p=[0.6, 0.3, 0.1])

        X = np.column_stack([
            rainfall, precip_prob, soil_moisture, slope,
            traffic, bridge_closed, terrain, road_type
        ])

        # Disruption vulnerability logic
        risk_score = (
            (rainfall / 90.0) * 0.40
            + (soil_moisture / 0.65) * 0.30
            + (slope / 25.0) * 0.20
            + (bridge_closed * 0.50)
            + np.random.normal(0, 0.05, n_samples)
        )
        y = np.where(risk_score > 0.62, 1, 0)
        return X, y

    def _train_initial_model(self):
        try:
            X, y = self._generate_synthetic_ner_disruption_dataset()
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

            self.model = LGBMClassifier(
                n_estimators=100,
                learning_rate=0.06,
                num_leaves=31,
                random_state=42,
                verbose=-1,
            )
            self.model.fit(X_train, y_train)

            preds = self.model.predict(X_test)
            self.accuracy = round(float(accuracy_score(y_test, preds)), 3)
            self.f1 = round(float(f1_score(y_test, preds)), 3)

            logger.info(f"DisruptionRiskPredictor initialized: Accuracy={self.accuracy}, F1={self.f1}")
        except Exception as exc:
            logger.error(f"Error training DisruptionRiskPredictor: {exc}")

    def predict_disruption_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        rainfall = float(data.get("rainfall_mm", 0.0))
        soil_m = float(data.get("soil_moisture", 0.35))
        slope = float(data.get("slope_deg", 8.0))
        bridge_closed = data.get("bridge_status") == "CLOSED"
        key_drivers = []

        if rainfall > 50.0:
            key_drivers.append(f"Severe precipitation ({rainfall:.1f} mm/h)")
        elif rainfall > 20.0:
            key_drivers.append(f"Moderate rainfall ({rainfall:.1f} mm/h)")

        if soil_m > 0.50:
            key_drivers.append(f"Water-saturated soil ({soil_m:.2f} m³/m³)")

        if slope > 14.0:
            key_drivers.append(f"High landslide-prone slope ({slope:.1f}°)")

        if bridge_closed:
            key_drivers.append("Connecting river bridge submerged / closed")

        if self.model:
            feat_vec = feature_service.build_disruption_features(data)
            proba = float(self.model.predict_proba(feat_vec)[0][1])
        else:
            proba = min(1.0, (rainfall / 100.0) * 0.5 + (soil_m / 0.6) * 0.5)

        if bridge_closed or proba >= 0.80:
            risk_class = "CRITICAL"
            status = "BLOCKED"
        elif proba >= 0.55:
            risk_class = "HIGH_RISK"
            status = "RISK"
        elif proba >= 0.30:
            risk_class = "WATCH"
            status = "WATCH"
        else:
            risk_class = "LOW"
            status = "OPEN"
            if not key_drivers:
                key_drivers.append("Normal terrain stability")

        return {
            "road_id": data.get("road_id", "CORRIDOR"),
            "disruption_probability": round(proba, 2),
            "risk_class": risk_class,
            "accessibility_status": status,
            "key_drivers": key_drivers,
            "model_name": self.model_name,
        }


disruption_predictor = DisruptionRiskPredictor()
