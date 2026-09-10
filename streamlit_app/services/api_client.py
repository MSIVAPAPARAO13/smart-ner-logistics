import os
import time
from typing import Optional

import requests

try:
    import streamlit as st
except Exception:  # pragma: no cover
    st = None


def _safe_secret(key: str, default: str = "") -> str:
    if st is None:
        return default
    try:
        return st.secrets.get(key, default)
    except Exception:
        return default


class APIClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or os.getenv("API_URL") or _safe_secret("API_URL", "http://127.0.0.1:8000")).rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self._auth_headers()

    def _auth_headers(self):
        token = os.getenv("API_TOKEN") or _safe_secret("API_TOKEN", "")
        role = os.getenv("X_USER_ROLE") or _safe_secret("X_USER_ROLE", "COMMAND_OPERATOR")
        if token:
            self.session.headers["Authorization"] = f"Bearer {token}"
        if role:
            self.session.headers["X-User-Role"] = role

    def _request(self, method: str, path: str, *, params=None, json=None, timeout=15, retries=2):
        if not self.base_url:
            raise RuntimeError("API_URL is not configured. Set a valid HTTPS backend URL.")
        url = f"{self.base_url}{path}"
        last_error = None
        for attempt in range(retries + 1):
            try:
                response = self.session.request(method, url, params=params, json=json, timeout=timeout)
                if response.status_code in {200, 201, 204}:
                    if response.content:
                        return response.json()
                    return {}
                if response.status_code in {400, 401, 403, 404, 409, 422, 429, 500, 503}:
                    try:
                        payload = response.json()
                        detail = payload.get("detail") if isinstance(payload, dict) else payload
                    except Exception:
                        detail = response.text
                    raise RuntimeError(f"HTTP {response.status_code}: {detail}")
                response.raise_for_status()
                return response.json() if response.content else {}
            except requests.RequestException as exc:
                last_error = exc
                if attempt < retries:
                    time.sleep(2 ** attempt)
                    continue
                raise RuntimeError(f"Request failed: {exc}")
            except RuntimeError:
                raise
        raise RuntimeError(f"Request failed after retries: {last_error}")

    def get(self, path: str, **kwargs):
        return self._request("GET", path, **kwargs)

    def post(self, path: str, **kwargs):
        return self._request("POST", path, **kwargs)

    def put(self, path: str, **kwargs):
        return self._request("PUT", path, **kwargs)

    def patch(self, path: str, **kwargs):
        return self._request("PATCH", path, **kwargs)

    def delete(self, path: str, **kwargs):
        return self._request("DELETE", path, **kwargs)


api_client = APIClient()
