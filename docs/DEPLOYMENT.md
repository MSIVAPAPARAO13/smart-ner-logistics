# SIH26002 Production Cloud Deployment Guide

## 1. Cloud Architecture Overview
```
                     [ Internet / Field Officers / Dispatchers ]
                                         │
                                   [ Cloudflare / CDN ]
                                         │
                                  [ Nginx Reverse Proxy ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
        [ Frontend Web App ]                           [ FastAPI Backend ]
        (Static Nginx Container)                     (Uvicorn Multi-Workers)
                                                                 │
                                                   ┌─────────────┴─────────────┐
                                                   │                           │
                                         [ PostgreSQL 16 + PostGIS ]     [ Redis Cache ]
```

---

## 2. Docker & Compose Setup

### Step 1: Clone and Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret key
```

### Step 2: Build and Launch Containers
```bash
docker-compose up -d --build
```

### Step 3: Verify Health Checks
```bash
# Liveness Probe
curl http://localhost:8000/api/v1/health/live

# Readiness Probe
curl http://localhost:8000/api/v1/health/ready

# Complete 16-Component Audit Matrix
curl http://localhost:8000/api/v1/health/demo-checklist
```

---

## 3. Database Migration & Seeding
The database schema is initialized and seeded on container startup via `init_db()` in `app.db.init_db`.
For manual seeding or resetting demo state:
```bash
docker-compose exec backend python -c "from app.db.init_db import init_db; from app.db.session import SessionLocal; init_db(SessionLocal())"
```

---

## 4. Production Resilience & Fallback Hierarchy
1. **Routing Fallback Hierarchy**:
   $$\text{GNN / RRNCO Neural Router} \longrightarrow \text{LightGBM + OR-Tools} \longrightarrow \text{Context Routing} \longrightarrow \text{OSRM Engine} \longrightarrow \text{Local NetworkX Topology}$$
2. **Weather Fallback**:
   $$\text{Open-Meteo Live API} \longrightarrow \text{IMD Advisory Bulletin} \longrightarrow \text{Cached Meteorological Data}$$
3. **Offline Field Queue**:
   $$\text{Offline IndexedDB / LocalStorage} \longrightarrow \text{Exponential Backoff (5 retries)} \longrightarrow \text{Idempotency Key Verification} \longrightarrow \text{PostGIS Synchronization}$$
