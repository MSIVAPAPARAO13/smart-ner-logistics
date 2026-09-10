# SIH26002 REST & WebSocket API Specification

## Base URL
- Local: `http://localhost:8000/api/v1`
- Production: `https://<domain>/api/v1`
- WebSocket: `ws://localhost:8000/ws/live`

---

## 1. Health & Verification Endpoints
- `GET /health`: Basic health overview
- `GET /health/ready`: Readiness probe for container orchestration
- `GET /health/live`: Liveness ping
- `GET /health/demo-checklist`: Complete 16-component verification matrix

## 2. Deep Learning & Routing Endpoints
- `GET /neural-routing/candidates`: Generate GNN / RRNCO candidate paths with directional grade logits
- `GET /neural-routing/compare-strategies`: 4-way strategy benchmark (OSRM, Context-Aware, Neural, Hybrid)

## 3. Fleet & Multi-Vehicle VRP
- `GET /vehicles`: List active fleet positions and cargo manifests
- `POST /optimization/run`: Trigger OR-Tools multi-vehicle fleet optimization solver

## 4. Supply Continuity & Stockout
- `GET /supplies/district-assessment`: Current inventory status and days of supply per district
- `GET /supplies/impact-graph`: Supply disruption graph and projected stockout timeline

## 5. Field Operations & Incident Lifecycle
- `GET /field-reports`: List all ground incident reports
- `POST /field-reports`: Submit a new incident report (geotagged GPS, severity, photo)
- `POST /field-reports/{id}/verify`: Officer verification transitioning state to `VERIFIED`
- `POST /field-reports/{id}/resolve`: Mark incident resolved and restore road status
- `POST /field-reports/upload`: Secure evidence photograph upload (5MB max, JPG/PNG/WEBP)

## 6. Multilingual Notifications
- `GET /notifications/languages`: List the 6 supported Northeast languages
- `GET /notifications/alert-multilingual`: Retrieve localized emergency message
- `POST /notifications/broadcast`: Multi-channel broadcast simulation (SMS, VHF Radio, Push)

## 7. Real-Time WebSocket Events (`/ws/live`)
- `VEHICLE_POSITION`: Real-time vehicle GPS coordinate tick
- `ROAD_STATUS_CHANGED`: Corridor accessibility score degradation or restoration
- `HAZARD_CREATED`: Flood / Landslide polygon detection
- `ROUTE_UPDATED`: Vehicle transition to green optimal alternate route
- `SUPPLY_RISK_CHANGED`: District inventory stockout projection update
- `ALERT_CREATED`: Emergency notification broadcast
