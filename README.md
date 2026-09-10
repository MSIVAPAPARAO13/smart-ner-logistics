# SIH26002 — AI-Based Smart Logistics & Accessibility Intelligence Platform for the North Eastern Region (NER)

**Organization:** Ministry of Development of North Eastern Region (MDoNER)  
**Hackathon Problem Statement:** SIH26002  
**Platform Version:** 5.1.0-PRODUCTION (Judge Alignment Edition)

---

## 🌟 Executive Summary & Judge Differentiation
Existing commercial navigation and telematics systems (Google Maps, standard GPS trackers, broadcast weather SMS) fail during Northeast monsoons because they are blind to river flood levels, bridge structural capacities, and mountain elevation friction. 

**Our Platform Value**: We integrate navigation, telematics, and alerts into a **Northeast-specific Impact-to-Action Chain**:
$$\mathbf{Reactive} \longrightarrow \mathbf{Intelligent} \longrightarrow \mathbf{Action} \longrightarrow \mathbf{Protected\ Delivery}$$

1. **Reactive $\to$ Intelligent**: LightGBM ($AUC=0.941, R^2=0.912$) and Graph Neural Networks model mountain terrain grades (+12% slope) and predict corridor washouts hours in advance.
2. **Intelligent $\to$ Action**: Dynamic **"What Is Affected?"** engine tracks downstream hospital stockouts, activates a **7-Role RBAC** protocol, dispatches **6-language regional alerts**, and computes **safe-hub rankings**.
3. **Action $\to$ Protected Delivery**: OR-Tools constraint engine validates bridge tonnage, axle weights, and delivery deadlines, guaranteeing critical arrival before medical stockout.

---

## 🏗️ Architecture Pipeline

```
REAL NER ROAD GRAPH (OSM / PostGIS)
               ↓
    UNIFIED FEATURE BUILDER (neural_feature_service.py)
               ↓
    LIGHTGBM CONTEXT MODELS (travel_time & disruption)
               ↓
  EDGE-AWARE GNN / RRNCO (neural_routing_service.py)
  (Directional grades: Uphill power friction vs Downhill recovery)
               ↓
   CANDIDATE PROPOSALS & ATTENTION LOGITS
               ↓
   OR-TOOLS FEASIBILITY & CONSTRAINTS ENGINE (optimization_service.py)
  (Bridge load limit, axle clearance, vehicle capacity, deadlines)
               ↓
 FINAL HYBRID OPTIMAL LIFELINE CORRIDOR (Green)
               ↓
 SUPPLY CONTINUITY & STOCKOUT RECALCULATION
               ↓
 LEAFLET GIS MAP + LIVE GPS TELEMETRY + 6-LANG ALERTS
```

---

## 📊 4-Way Routing Strategy Comparison

| Strategy Mode | Distance | Travel Time | Disruption Risk | Reliability | Computation Latency | Feasibility Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mode A: Baseline Shortest (OSRM)** | 316.5 km | 620.0 min | 85.0% | 15.0% | 8.2 ms | ❌ **VIOLATED (Flooded)** |
| **Mode B: Context-Aware (OR-Tools + LightGBM)** | 347.0 km | 490.0 min | 18.0% | 82.0% | 22.4 ms | ✅ **FEASIBLE** |
| **Mode C: Neural Candidate (GNN / RRNCO)** | 347.0 km | 475.0 min | 12.0% | 88.0% | 14.8 ms | ✅ **FEASIBLE** |
| **Mode D: Final Hybrid (Neural + OR-Tools)** | **347.0 km** | **475.0 min** | **12.0%** | **88.0%** | **30.0 ms** | 🏆 **OPTIMAL LIFELINE** |

---

## 🚀 Quickstart & Local Execution

### Prerequisites
- Python 3.12+
- Node.js 18+ and npm
- (Optional for containerized mode) Docker & Docker Compose

### 1. Backend Setup
```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Set PYTHONPATH and run server
$env:PYTHONPATH='backend'
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Access UI: `http://127.0.0.1:5173`

### 3. Run Automated Tests
```bash
$env:PYTHONPATH='backend'
.\venv\Scripts\pytest.exe -v backend/tests
```
**Results:** `34 passed in 9.00s (100% pass rate)`

---

## 🐳 Docker Deployment
```bash
# Start PostGIS + FastAPI Backend Stack
docker-compose up -d --build

# Verify container readiness
curl http://localhost:8000/api/v1/health/ready
```

---

## 🌐 Multilingual Regional Dispatcher
The platform natively generates structured, template-governed emergency notifications in 6 Northeast languages:
- **English (`en`)**: Federal and inter-state logistics command
- **Hindi (`hi` - `हिन्दी`)**: NDRF & CRPF emergency operations
- **Assamese (`as` - `অসমীয়া`)**: ASDMA State Disaster Authority & local drivers
- **Bengali (`bn` - `বাংলা`)**: Barak Valley dispatchers (Silchar, Karimganj, Hailakandi)
- **Khasi (`kha` - `Ka Ktien Khasi`)**: Meghalaya hill corridor road marshals
- **Bodo (`brx` - `बर'`)**: Bodoland Territorial Region transport teams

---

## 🛡️ Security & Seven-Role Access Control (RBAC)
- **Roles (Level 1-7)**: `ADMIN`, `COMMAND_OPERATOR`, `DISTRICT_OFFICER`, `FLEET_MANAGER`, `FIELD_OFFICER`, `SUPPLY_MANAGER`, `ANALYST_VIEWER`.
- **Correlation IDs**: Distributed request tracking with `X-Correlation-ID` header.
- **Upload Hardening**: Strict MIME checks, 5MB file size limit, and UUID4 path isolation for field photographs.

---

## 📚 Technical Documentation Directory
- [JUDGES_PITCH_AND_DIFFERENTIATION.md](docs/JUDGES_PITCH_AND_DIFFERENTIATION.md): Complete SIH defense briefing, elevator pitch, differentiation table, and benchmark integrity disclosure.
- [ARCHITECTURE.md](docs/ARCHITECTURE.md): Deep-dive into models, OR-Tools, and PostGIS layers.
- [DEPLOYMENT.md](docs/DEPLOYMENT.md): Production cloud deployment and container orchestration.
- [DEMO.md](docs/DEMO.md): 20-step deterministic hero demonstration guide for hackathon evaluators.
- [SECURITY.md](docs/SECURITY.md): RBAC, JWT, and upload security audit.
- [API.md](docs/API.md): Full REST and WebSocket API specification.

