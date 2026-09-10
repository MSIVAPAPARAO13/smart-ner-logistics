# Routing Module Architecture (SIH26002)

## Current Milestone (Phase 1)
- **OSRM Integration**: Queries live road network geometries, turn-by-turn steps, distance, duration, and native alternatives.
- **Topological Graph Fallback**: Built on `NetworkX`, storing real-world highway nodes (Guwahati, Shillong, Jowai, Ladrymbai, Silchar, Nagaon, Haflong, Jorhat) and highway segment geometries.
- **Spatial Hazard Intersection**: Uses `Shapely` for LineString-Polygon collision checks to detect blocked corridors.

## Next Milestone (Phase 2 & 3)
- **Constrained Optimization**: Google OR-Tools integration for multi-depot Vehicle Routing Problem (VRP) under dynamic bridge weight & clearance limits.
- **Neural Route Candidate**: RRNCO / Graph Attention Network for heuristic fast candidates in sparse road networks.
