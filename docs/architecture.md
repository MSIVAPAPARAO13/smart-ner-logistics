# SIH26002 - NER Smart Logistics & Accessibility Intelligence Platform Architecture

## Ministry of Development of North Eastern Region (MDoNER)

### 1. System Overview
```
                   +----------------------------------+
                   |  React + Leaflet GIS Dashboard   |
                   |  (~70% Map / ~20% Operational)   |
                   +-----------------+----------------+
                                     ^
                         WebSocket   |   REST APIs
                         (/ws/live)  |   (/api/v1/*)
                                     v
                   +-----------------+----------------+
                   |         FastAPI Backend          |
                   +--------+--------+--------+-------+
                            |        |        |
        +-------------------+        |        +-------------------+
        |                            |                            |
        v                            v                            v
+-------+-------+           +--------+--------+          +--------+--------+
|  PostgreSQL / |           | Routing Engine  |          | External Data   |
|    PostGIS    |           | (OSRM + NetX)   |          | (Open-Meteo,IMD)|
+---------------+           +-----------------+          +-----------------+
```

### 2. State & Rerouting Lifecycle
1. **Normal Dispatch**: Vehicle `NER-TRK-01` departs Guwahati Hub carrying Emergency Medical Supplies along NH-6.
2. **Hazard Detection**: Flash flood / landslide polygon detected on NH-6 Ladrymbai sector.
3. **Road Status Transition**: `ROAD-NH06-SHL-SIL` marked `BLOCKED`, bridge marked `CLOSED`.
4. **Dynamic Rerouting**: Routing engine computes alternate corridor via NH-27/NH-54 (Nagaon - Haflong bypass).
5. **Vehicle Transition**: Vehicle smoothly shifts to the alternate path and proceeds towards Silchar.
6. **ETA Revision**: Revised ETA (+55 min delay) displayed with complete historical timeline log.
