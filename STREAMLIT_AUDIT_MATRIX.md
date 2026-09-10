| Requirement | Existing Backend/API | Streamlit Screen | Implementation | Test | Evidence | Status |
|-------------|----------------------|------------------|----------------|------|----------|--------|
| Dynamic From/To | `/api/v1/routes/plan` | Command Center | API-driven origin/destination inputs | Manual | Route request payload | In Progress |
| Map | Mapbox + backend route data | Command Center | Folium/Mapbox styled view | Manual | UI renders route markers | In Progress |
| Route planning | `/api/v1/routes/plan` | Routing | Calls backend optimization endpoint | Manual | API response object | In Progress |
| AI route | `/api/v1/neural-routing` | Routing | Displays route recommendations | Manual | Response fields | Planned |
| Fleet | `/api/v1/vehicles` | Fleet | Lists vehicles and status | Manual | API data | Planned |
| GPS | `/api/v1/vehicles/{id}/positions` | Fleet | Displays current GPS track | Manual | Position entries | Planned |
| Road disruption | `/api/v1/roads`, `/api/v1/alerts` | Alerts | Shows active blocked road state | Manual | Data sources | Planned |
| Bridge disruption | `/api/v1/bridges` | Alerts | Displays bridge status | Manual | Bridge objects | Planned |
| Impact propagation | `/api/v1/impact` | Command Center | Shows consequences chain | Manual | Impact response | Planned |
| Supply continuity | `/api/v1/supplies` | Supply | Displays hospital and supply risk | Manual | Supply data | Planned |
| Safe hub | `/api/v1/safe-hubs/nearest` | Supply | Ranks safest hubs | Manual | Hub ranking response | Planned |
| Field reports | `/api/v1/field-reports` | Field Operations | Submit and review reports | Manual | Report objects | Planned |
| Image upload | `/api/v1/field-reports` | Field Operations | Upload and display image URL | Manual | Photo URL persistence | Planned |
| Offline queue | Client-side queue pattern | Field Operations | Queue state and errors | Manual | UI status badges | Planned |
| Alerts | `/api/v1/alerts` | Alerts | Shows labeled alert sources | Manual | Alert records | Planned |
| Multilingual | Local language catalog in backend | Shared UI | Language switcher | Manual | Translation dictionary | Planned |
| RBAC | `/api/v1/auth` | Role-aware UI | Hides restricted actions | Manual | Role headers and UI | Planned |
| Authentication | `/api/v1/auth/me` | App shell | Reads role and current user | Manual | Configured header flow | Planned |
| Health | `/api/v1/health` | Health | Backend readiness panel | Manual | Health JSON | Planned |
| Data-source labeling | Backend providers | All screens | Show LIVE/CACHED/ML/SIMULATION tags | Manual | Source metadata | Planned |
| Error handling | API error responses | All screens | Friendly empty/error states | Manual | UI messages | Planned |
| Deployment | HTTPS backend + Streamlit Cloud | Cloud | Deployment guide | Manual | Docs | Planned |
