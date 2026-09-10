import os
import sys
from typing import Any, Dict

import pandas as pd
import plotly.express as px
import streamlit as st

sys.path.insert(0, os.path.dirname(__file__))
from services.api_client import api_client

st.set_page_config(
    page_title="NER Logistics Intelligence",
    page_icon="🛣️",
    layout="wide",
    initial_sidebar_state="expanded",
)

APP_TITLE = "NER Logistics Intelligence"
st.title(APP_TITLE)
st.caption("AI-powered logistics decision support for resilient transportation across North Eastern Region.")

if "selected_lang" not in st.session_state:
    st.session_state.selected_lang = "en"


LANGS = {
    "en": "English",
    "hi": "हिन्दी",
    "as": "অসমীয়া",
    "bn": "বাংলা",
    "kh": "Khasi",
    "brx": "बर'",
}


@st.cache_data
def get_health_status() -> Dict[str, Any]:
    try:
        return api_client.get("/api/v1/health")
    except Exception as exc:
        return {"status": "UNAVAILABLE", "error": str(exc)}


@st.cache_data
def get_route_demo() -> Dict[str, Any]:
    payload = {
        "origin": "Guwahati",
        "destination": "Silchar",
        "origin_lat": 26.1445,
        "origin_lng": 91.7362,
        "dest_lat": 24.8333,
        "dest_lng": 92.7789,
        "origin_name": "Guwahati",
        "destination_name": "Silchar",
        "cargo_type": "EMERGENCY_MEDICAL_SUPPLIES",
        "priority": "CRITICAL",
        "avoid_hazards": True,
        "vehicle_weight_tons": 16.0,
    }
    try:
        return api_client.post("/api/v1/routes/plan", json=payload)
    except Exception as exc:
        return {"error": str(exc)}


left, right = st.columns([2, 1])
with left:
    st.subheader("COMMAND CENTER")
    origin = st.text_input("FROM", value="Guwahati")
    destination = st.text_input("TO", value="Silchar")
    if st.button("OPTIMIZE ROUTE"):
        st.session_state.last_route = {
            "origin": origin,
            "destination": destination,
        }

with right:
    status = get_health_status()
    status_label = status.get("status", "UNAVAILABLE")
    st.metric("Backend", status_label)
    if "error" in status:
        st.warning(status["error"])

route_result = get_route_demo()
if "error" not in route_result:
    rec = route_result.get("recommended_route", {})
    st.subheader("Recommended Route")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("ETA", f"{rec.get('travel_time_min', 0)} min")
    col2.metric("Distance", f"{rec.get('distance_km', 0):.1f} km")
    col3.metric("Risk", f"{rec.get('disruption_risk_score', 0):.2f}")
    col4.metric("Reliability", f"{rec.get('reliability_score', 0):.2f}")

    with st.expander("WHY THIS ROUTE?"):
        for reason in rec.get("why_this_route", ["Route recommendation unavailable."]):
            st.write(f"✓ {reason}")

    st.subheader("Impact propagation")
    fig = px.bar(
        pd.DataFrame(
            {
                "Stage": ["Road disruption", "Travel time increase", "Delivery delay", "Inventory depletion", "Stockout risk", "AI rerouting", "ETA improves", "Supply protected"],
                "Impact": [8, 7, 6, 5, 4, 3, 2, 1],
            }
        ),
        x="Stage",
        y="Impact",
        color="Stage",
    )
    fig.update_layout(showlegend=False, xaxis_tickangle=30)
    st.plotly_chart(fig, use_container_width=True)
else:
    st.warning("Backend unavailable. Configure API_URL and verify the FastAPI service is running.")

# Basic navigation for demo screens.
st.sidebar.header("Navigation")
st.sidebar.selectbox("Language", options=list(LANGS.keys()), index=0, format_func=lambda k: LANGS[k])
st.sidebar.button("Run Hero Scenario")
st.sidebar.write("Operational status depends on available government feeds, field reports, provider data and model predictions.")
