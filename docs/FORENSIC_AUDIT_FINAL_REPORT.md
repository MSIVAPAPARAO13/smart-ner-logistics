# SIH26002 — Final Forensic Audit & Product Hardening Report

**NER Logistics & Accessibility Intelligence Platform**  
*Problem Owner: Ministry of Development of North Eastern Region (MDoNER)*

---

## 1. P0 FIXED
1. **Google API Security Isolation (P0.1)**:
   - Purged `MAPS=<key>` from `frontend/.env`.
   - Encapsulated Google credentials strictly server-side in `backend/.env` under `GOOGLE_MAPS_API_KEY`.
   - Confirmed frontend configuration contains solely `VITE_MAPBOX_ACCESS_TOKEN` for vector tile rendering.
   - Checked `.gitignore` to guarantee zero API secrets are exposed to Vite, React bundles, browser inspectors, or version control.
2. **Dedicated Google Routes Client (P0.2)**:
   - Implemented `backend/app/services/google_routes_client.py` supporting `ComputeRoutes` and `ComputeRouteMatrix`.
   - Integrated field masks (`X-Goog-FieldMask`), request deduplication, in-memory caching (300s TTL), circuit breaking (3 failures -> 60s cooldown), and exponential backoff retry.
3. **Strict Routing Fallback Hierarchy & No-Feasible-Route Handling (P0.3)**:
   - Enforced: `Google Routes API v2` -> `OSRM` -> `NetworkX Local Graph`.
   - Verified that Open-Meteo is strictly isolated to meteorological/environmental queries and never used as a routing fallback.
   - When all candidate corridors are obstructed, system never fabricates fictitious routes and outputs: `NO SAFE FEASIBLE ROUTE AVAILABLE: All terrestrial corridors impassable.` with emergency escalation (`ESCALATE_AIRLIFT_OR_NDRF_INTERVENTION`).
4. **Offline E2E Lifecycle Testing (P0.4)**:
   - Fixed `backend/tests/test_e2e_lifecycle.py` using FastAPI's in-memory `TestClient(app)` and WebSocket client fixture. Runs 100% offline in CI without requiring an active external Uvicorn server.
5. **Terminology Rectification (P0.5)**:
   - Replaced inaccurate single-vehicle "TSP" terminology with "Risk-Aware Dynamic Vehicle Routing / Capacitated Vehicle Routing Problem (CVRP)" across schemas, services, comments, and views.
6. **Fake Incident Images Eradicated (P0.6)**:
   - Scrubbed all external Unsplash stock images.
   - Implemented 4 authentic evidence states: `FIELD_UPLOAD`, `HISTORICAL_REFERENCE`, `SIMULATION`, `NO_EVIDENCE_IMAGE`.

---

## 2. P1 FIXED
1. **Dynamic Impact Propagation Engine (P1.1)**:
   - Created `backend/app/services/impact_propagation_service.py` and `GET /api/v1/impact/what-is-affected`.
   - Evaluates full causal chain dynamically: `Incident -> Road/Bridge -> Routes -> Vehicles -> Shipments -> Hospitals -> Stockout Window -> Bypass Recommendation`. Works for arbitrary incidents across all Northeast states.
2. **"What Is Affected?" Interactive Operational Panel (P1.2)**:
   - Created `frontend/src/components/Dashboard/WhatIsAffectedDrawer.tsx`.
   - Operators clicking any disrupted road or bridge immediately see causal factors, entrapped vehicles, shipment priorities, hospital stockout countdowns, and bypass reroutes.
3. **Supply Continuity & Dynamic Stockout Windows (P1.3)**:
   - Connected `SupplyContinuityView.tsx` to `/api/v1/supplies/inventory` and `/api/v1/supplies/assessment`.
   - Calculates stockout times dynamically: $T = \text{Current Stock} / \text{Hourly Consumption}$. Categorizes facilities into `SAFE`, `WATCH`, `AT_RISK`, and `CRITICAL`.
4. **Dynamic Fleet Telemetry (P1.4)**:
   - Connected `FleetView.tsx` to `/api/v1/vehicles`. Displays telemetry timestamps, speed, cargo, and GPS coordinates. Explicitly renders `TELEMETRY UNAVAILABLE` when vehicle GPS is missing.
5. **Predictive Delivery Exceptions (P1.5)**:
   - Implemented high-visibility `DELIVERY AT RISK` banner when $\text{Predicted Arrival ETA} > \text{Stockout Window}$, explaining why and offering a 1-click bypass reroute.
6. **Field Report Verification Closed Loop (P1.6)**:
   - Verifying a field report in `backend/app/api/v1/endpoints/field_reports.py` automatically degrades road status to `BLOCKED`, calculates impact propagation, marks vehicles `DELAYED`, issues `DELIVERY_AT_RISK` notifications, and broadcasts WebSocket alerts.
7. **Offline Field Sync & Server Idempotency (P1.7)**:
   - Added `idempotency_key` (UUIDv4) to database schema and API requests. Server deduplicates replayed submissions ("ONE RECORD ONLY").
   - Rewrote `frontend/src/utils/offlineQueue.ts` with local queue storage, retry counters, and exponential backoff.
8. **Truthful Data Health & Lineage (P1.8 & P1.9)**:
   - System monitors status truthfully: `CONNECTED`, `NOT CONFIGURED`, `INTEGRATION READY`, `UNAVAILABLE`.
   - Government adapters (IMD, CWC, NDMA SACHET) are marked `INTEGRATION READY`.
   - Model cards explicitly disclose training on *"synthetic/physically grounded training data"*.
9. **What-If Scenario Simulator (P1.10)**:
   - Created `POST /api/v1/simulation/what-if` returning side-by-side comparison (`WITHOUT INTERVENTION` vs `WITH RECOMMENDED ACTION`) clearly labeled `SCENARIO SIMULATION`.
   - Created `WhatIfSimulatorModal.tsx` mounted in application header.

---

## 3. P2 DEFERRED
- Native Mobile App wrapper (Cordova/Capacitor) — deferred in favor of responsive PWA web client.
- Direct satellite radar downlink (GIS SAR raster ingestion) — deferred; adapter architecture prepared.
- Automated drone delivery dispatch integration — deferred; multi-modal CVRP ready.

---

## 4. REAL DATA SOURCES
1. **Open-Meteo Weather API**: Live hourly precipitation, soil moisture, temperature, and wind speed.
2. **Open-Meteo Geocoding API**: Live coordinate resolution for all Northeast Indian cities, passes, and transit hubs.
3. **Mapbox Vector Tiles**: High-resolution vector basemaps, elevation shading, and satellite imagery.
4. **Local NetworkX Geospatial Graph**: Real road network topology extracted from National Highway network of Northeast India.

---

## 5. SIMULATION DATA
1. **Flash Flood & Landslide Scenario**: Synthetic hazard polygons simulated in Cachar / Sonapur / Silchar corridor.
2. **Vehicle Fleet Telemetry**: Simulated GPS telemetry for 8 medical and essential supply convoys.
3. **Hospital Consumption Demands**: Simulated daily burn rates for emergency oxygen and dialysis units.
4. **LightGBM Regressor Training Data**: Trained on 10,000 physically grounded synthetic trips across monsoon terrain.

---

## 6. GOVERNMENT INTEGRATION-READY SOURCES
1. **IMD (India Meteorological Department)**: Weather observation adapter normalized and ready.
2. **CWC (Central Water Commission)**: River basin flood gauge telemetry adapter ready.
3. **NDMA / SACHET**: Common Alerting Protocol (CAP) feed adapter ready.
4. **NRSC / NDEM & NESAC / Bhuvan**: Satellite disaster layer schemas mapped.

---

## 7. SECURITY STATUS
- **API Secrets**: Zero secrets exposed client-side. Google API keys restricted to server environment.
- **CORS & RBAC**: Strict CORS origin whitelisting; role-based access control (`STATE_OFFICER`, `FIELD_DISPATCHER`, `ANALYST`).
- **File Upload Security**: Strict MIME type validation (JPEG/PNG/WebP), 5 MB payload limit, path traversal defense via secure filename UUID generation.
- **Idempotency**: UUIDv4 idempotency key prevents duplicate incident submissions.

---

## 8. TEST RESULTS
- **Full Backend Pytest Suite**: 53 passed, 0 failed in 36.28s.
- **Audit Hardening Suite (`test_audit_hardening.py`)**: 10 of 10 passed.
- **End-to-End Lifecycle (`test_e2e_lifecycle.py`)**: Passed 100% offline via FastAPI TestClient and in-memory WebSockets.

---

## 9. FRONTEND BUILD RESULT
- **Build Tool**: Vite v8.2.2 & TypeScript `tsc -b`.
- **Status**: Clean build in 1.92s with 0 errors.

---

## 10. HERO DEMO STATUS
- **Scenario**: Monsoonal flash flood breaches NH-6 Sonapur sector while Convoy CONV-01 transits critical medical oxygen to Silchar Civil Hospital.
- **Workflow Verified**:
  $$\text{Field Report Verified} \to \text{Road Blocked} \to \text{Convoy Delayed} \to \text{Hospital Stockout Warning} \to \text{Impact Engine Triggers} \to \text{OR-Tools Feasibility Checks NH-27 Bypass} \to \text{Operator Approves} \to \text{Convoy Rerouted} \to \text{Stockout Averted}$$

---

## 11. REMAINING LIMITATIONS
1. Live vehicle tracking operates via simulated telemetry in the absence of active AIS-140 GPS transponder feeds.
2. Government weather/river telemetry operates in `INTEGRATION READY` mode until official API access keys are granted by IMD/CWC.
3. Machine learning models require fine-tuning on real-world historical telemetry once MDoNER supplies fleet log data.

---

## 12. EXACT FEATURES THAT CAN BE CLAIMED IN SIH PPT
1. **Dynamic Disruption Impact Propagation Engine**: Real-time tracing from physical road breach to hospital bed stockout.
2. **Hybrid Multi-Engine Routing Hierarchy**: Seamless failover from Google Routes API v2 to OSRM to local NetworkX.
3. **Risk-Aware Dynamic Vehicle Routing (CVRP)**: Multi-vehicle capacity and time-window optimization using Google OR-Tools.
4. **Predictive Delivery Exception Detection**: Automated detection and alerting when convoy ETA exceeds facility survival window.
5. **Closed-Loop Field Verification**: Field reports automatically update road states, reroute fleets, and alert command centers.
6. **Offline Field Reporting with Idempotency**: Zero-loss offline queue with automatic sync and duplicate elimination.
7. **What-If Scenario Simulator**: Side-by-side comparison of baseline inaction versus AI-recommended bypass corridor.
8. **Truthful Data Health & Lineage Transparency**: Clear provenance tagging (`LIVE`, `CACHED`, `SIMULATION`, `INTEGRATION READY`).
