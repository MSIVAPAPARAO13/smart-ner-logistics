# Streamlit API Integration

## Overview

The Streamlit UI is a presentation layer for the existing SIH26002 FastAPI backend. It must not duplicate backend logic; it reads live API responses and presents them with clear source labeling.

## Core endpoints

| Endpoint | Method | Purpose | Authentication | Streamlit screen | Notes |
| --- | --- | --- | --- | --- | --- |
| `/api/v1/health` | GET | Service health and provider state | None | System health | Returns provider status |
| `/api/v1/auth/me` | GET | Current user profile | Header-based role or token | App shell | RBAC-aware |
| `/api/v1/auth/users` | GET | User roster | Role-based | Admin | Requires authorization |
| `/api/v1/routes/plan` | POST | Dynamic route optimization | None by default | Command Center / Routing | Primary integration |
| `/api/v1/vehicles` | GET | Fleet list | None by default | Fleet | Real vehicle data |
| `/api/v1/vehicles/{id}/positions` | GET | GPS telemetry | None by default | Fleet | Optional details |
| `/api/v1/field-reports` | GET/POST | Field reports | None by default | Field Operations | Can include uploaded image |
| `/api/v1/field-reports/{id}/verify` | POST | Verification workflow | RBAC | Field Operations | Role-protected |
| `/api/v1/alerts` | GET/POST | Alert feed | None by default | Alerts | Source labels |
| `/api/v1/supplies` | GET | Supply continuity and stockout metrics | None by default | Supply Continuity | Supply risk display |
| `/api/v1/safe-hubs/nearest` | GET | Safe hub ranking | None by default | Supply | Hub recommendation |
| `/api/v1/impact` | GET | Impact propagation | None by default | Command Center | Consequence chain |
| `/api/v1/weather` | GET | Weather context | None by default | Health | Live environment context |
| `/api/v1/notifications` | GET | Multilingual alert messages | None by default | Alerts | Regional language support |

## Error handling

- 200/201/204: display success
- 400/422: validation issue
- 401: authentication required
- 403: unauthorized role
- 404: not found
- 429: rate-limited
- 500/503: backend degraded
- timeouts: friendly retry message

## Secrets

Use Streamlit Cloud secrets or environment variables for `API_URL`, `MAPBOX_TOKEN`, and optional auth headers. Never commit real secrets to Git.
