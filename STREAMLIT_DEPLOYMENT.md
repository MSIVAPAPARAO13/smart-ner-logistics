# Streamlit Deployment Guide

## 1. Prerequisites

- The FastAPI backend must already be deployed and reachable over HTTPS.
- Ensure the backend exposes the existing API routes under `/api/v1`.
- Configure a public `API_URL` in Streamlit Cloud secrets.
- If the backend uses RBAC, set the relevant auth headers or tokens.

## 2. GitHub push

1. Commit the Streamlit app and related docs.
2. Push the branch to GitHub.
3. Open Streamlit Community Cloud.

## 3. Create app

1. Sign in with GitHub.
2. Choose `New app`.
3. Select the repository.
4. Set the main file to `streamlit_app/app.py`.
5. Set the Python version to a compatible release.
6. Add secrets:

```toml
API_URL = "https://your-fastapi-api.example.com"
MAPBOX_TOKEN = "your-token"
```

## 4. Deployment checks

- Confirm health: `GET /api/v1/health`
- Confirm route planning: `POST /api/v1/routes/plan`
- Confirm field reports: `GET /api/v1/field-reports`
- Confirm alerts: `GET /api/v1/alerts`
- Confirm supply continuity: `GET /api/v1/supplies`
- Verify map renders and route optimization responds.

## 5. Runtime notes

- Streamlit Cloud does not replace the backend database.
- The authoritative database remains PostgreSQL/PostGIS for production.
- Streamlit is a demo/monitoring layer that calls the real backend.
