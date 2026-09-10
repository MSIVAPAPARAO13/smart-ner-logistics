import logging
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("sih26002.geocoding")

# Built-in High-Fidelity Northeast India Locations Catalog (All 8 States)
NER_PRELOADED_LOCATIONS: List[Dict[str, Any]] = [
    # ASSAM
    {"name": "Guwahati", "state": "Assam", "country": "India", "latitude": 26.1445, "longitude": 91.7362, "elevation": 55, "type": "Hub"},
    {"name": "Guwahati GMCH (Gauhati Medical College & Hospital)", "state": "Assam", "country": "India", "latitude": 26.1585, "longitude": 91.7725, "elevation": 58, "type": "Hospital"},
    {"name": "Guwahati Regional Logistics Depot", "state": "Assam", "country": "India", "latitude": 26.1445, "longitude": 91.7362, "elevation": 55, "type": "Warehouse"},
    {"name": "Silchar", "state": "Assam", "country": "India", "latitude": 24.8333, "longitude": 92.7789, "elevation": 25, "type": "Hub"},
    {"name": "Silchar Civil Hospital & Medical Store", "state": "Assam", "country": "India", "latitude": 24.8239, "longitude": 92.8012, "elevation": 25, "type": "Hospital"},
    {"name": "Cachar Central Relief Warehouse", "state": "Assam", "country": "India", "latitude": 24.8290, "longitude": 92.7930, "elevation": 26, "type": "Warehouse"},
    {"name": "Nagaon", "state": "Assam", "country": "India", "latitude": 26.3452, "longitude": 92.6840, "elevation": 60, "type": "Corridor"},
    {"name": "Nagaon Civil Hospital & Staging Area", "state": "Assam", "country": "India", "latitude": 26.3452, "longitude": 92.6840, "elevation": 60, "type": "Hospital"},
    {"name": "Dibrugarh", "state": "Assam", "country": "India", "latitude": 27.4728, "longitude": 94.9120, "elevation": 108, "type": "City"},
    {"name": "Jorhat", "state": "Assam", "country": "India", "latitude": 26.7509, "longitude": 94.2037, "elevation": 116, "type": "City"},
    {"name": "Tezpur", "state": "Assam", "country": "India", "latitude": 26.6528, "longitude": 92.7926, "elevation": 48, "type": "City"},
    {"name": "Tinsukia", "state": "Assam", "country": "India", "latitude": 27.5000, "longitude": 95.3667, "elevation": 125, "type": "City"},
    {"name": "Haflong", "state": "Assam", "country": "India", "latitude": 25.1700, "longitude": 93.0200, "elevation": 680, "type": "Hill Station"},
    {"name": "Haflong Civil Hospital & Relief Depot", "state": "Assam", "country": "India", "latitude": 25.1700, "longitude": 93.0200, "elevation": 680, "type": "Hospital"},
    {"name": "Bongaigaon", "state": "Assam", "country": "India", "latitude": 26.5022, "longitude": 90.5532, "elevation": 54, "type": "City"},
    {"name": "Lumding", "state": "Assam", "country": "India", "latitude": 25.7500, "longitude": 93.1700, "elevation": 125, "type": "Transit Junction"},
    {"name": "Karimganj", "state": "Assam", "country": "India", "latitude": 24.8647, "longitude": 92.3592, "elevation": 13, "type": "Border District"},
    
    # MEGHALAYA
    {"name": "Shillong", "state": "Meghalaya", "country": "India", "latitude": 25.5788, "longitude": 91.8933, "elevation": 1525, "type": "Capital"},
    {"name": "Shillong Civil Hospital", "state": "Meghalaya", "country": "India", "latitude": 25.5788, "longitude": 91.8933, "elevation": 1525, "type": "Hospital"},
    {"name": "NEIGRIHMS Shillong", "state": "Meghalaya", "country": "India", "latitude": 25.5996, "longitude": 91.9392, "elevation": 1550, "type": "Hospital"},
    {"name": "Jowai", "state": "Meghalaya", "country": "India", "latitude": 25.4485, "longitude": 92.2038, "elevation": 1380, "type": "District HQ"},
    {"name": "Ladrymbai", "state": "Meghalaya", "country": "India", "latitude": 25.3120, "longitude": 92.3550, "elevation": 1200, "type": "Critical Pass"},
    {"name": "Cherrapunji", "state": "Meghalaya", "country": "India", "latitude": 25.2700, "longitude": 91.7300, "elevation": 1484, "type": "Rainfall Hotspot"},
    {"name": "Tura", "state": "Meghalaya", "country": "India", "latitude": 25.5144, "longitude": 90.2033, "elevation": 349, "type": "Hub"},
    {"name": "Nongpoh", "state": "Meghalaya", "country": "India", "latitude": 25.9038, "longitude": 91.8797, "elevation": 485, "type": "Corridor"},
    {"name": "Dawki", "state": "Meghalaya", "country": "India", "latitude": 25.1833, "longitude": 92.0167, "elevation": 25, "type": "Border Post"},


    # MANIPUR
    {"name": "Imphal", "state": "Manipur", "country": "India", "latitude": 24.8170, "longitude": 93.9368, "elevation": 786, "type": "Capital"},
    {"name": "Churachandpur", "state": "Manipur", "country": "India", "latitude": 24.3333, "longitude": 93.6667, "elevation": 922, "type": "District HQ"},
    {"name": "Thoubal", "state": "Manipur", "country": "India", "latitude": 24.6333, "longitude": 94.0167, "elevation": 775, "type": "District HQ"},
    {"name": "Ukhrul", "state": "Manipur", "country": "India", "latitude": 25.1167, "longitude": 94.3667, "elevation": 1662, "type": "Hill District"},
    {"name": "Senapati", "state": "Manipur", "country": "India", "latitude": 25.2667, "longitude": 94.0167, "elevation": 1050, "type": "Corridor"},
    {"name": "Moreh", "state": "Manipur", "country": "India", "latitude": 24.2467, "longitude": 94.3050, "elevation": 228, "type": "International Gate"},

    # ARUNACHAL PRADESH
    {"name": "Itanagar", "state": "Arunachal Pradesh", "country": "India", "latitude": 27.0844, "longitude": 93.6053, "elevation": 320, "type": "Capital"},
    {"name": "Tawang", "state": "Arunachal Pradesh", "country": "India", "latitude": 27.5861, "longitude": 91.8594, "elevation": 3048, "type": "Strategic Pass"},
    {"name": "Pasighat", "state": "Arunachal Pradesh", "country": "India", "latitude": 28.0667, "longitude": 95.3333, "elevation": 153, "type": "District HQ"},
    {"name": "Ziro", "state": "Arunachal Pradesh", "country": "India", "latitude": 27.5956, "longitude": 93.8385, "elevation": 1572, "type": "Valley HQ"},
    {"name": "Bomdila", "state": "Arunachal Pradesh", "country": "India", "latitude": 27.2645, "longitude": 92.4159, "elevation": 2415, "type": "Mountain Sector"},
    {"name": "Tezu", "state": "Arunachal Pradesh", "country": "India", "latitude": 27.9167, "longitude": 96.1667, "elevation": 210, "type": "District HQ"},

    # MIZORAM
    {"name": "Aizawl", "state": "Mizoram", "country": "India", "latitude": 23.7271, "longitude": 92.7176, "elevation": 1132, "type": "Capital"},
    {"name": "Lunglei", "state": "Mizoram", "country": "India", "latitude": 22.8833, "longitude": 92.7333, "elevation": 722, "type": "District HQ"},
    {"name": "Champhai", "state": "Mizoram", "country": "India", "latitude": 23.4757, "longitude": 93.3283, "elevation": 1334, "type": "Border Sector"},
    {"name": "Kolasib", "state": "Mizoram", "country": "India", "latitude": 24.2246, "longitude": 92.6784, "elevation": 610, "type": "Corridor"},
    {"name": "Serchhip", "state": "Mizoram", "country": "India", "latitude": 23.3411, "longitude": 92.8503, "elevation": 888, "type": "District HQ"},

    # NAGALAND
    {"name": "Kohima", "state": "Nagaland", "country": "India", "latitude": 25.6751, "longitude": 94.1086, "elevation": 1444, "type": "Capital"},
    {"name": "Dimapur", "state": "Nagaland", "country": "India", "latitude": 25.9068, "longitude": 93.7271, "elevation": 145, "type": "Rail / Logistics Hub"},
    {"name": "Mokokchung", "state": "Nagaland", "country": "India", "latitude": 26.3256, "longitude": 94.5217, "elevation": 1325, "type": "District HQ"},
    {"name": "Wokha", "state": "Nagaland", "country": "India", "latitude": 26.0989, "longitude": 94.2631, "elevation": 1313, "type": "Corridor"},
    {"name": "Mon", "state": "Nagaland", "country": "India", "latitude": 26.7461, "longitude": 95.0603, "elevation": 898, "type": "Border District"},
    {"name": "Tuensang", "state": "Nagaland", "country": "India", "latitude": 26.2825, "longitude": 94.8294, "elevation": 1371, "type": "District HQ"},

    # SIKKIM
    {"name": "Gangtok", "state": "Sikkim", "country": "India", "latitude": 27.3389, "longitude": 88.6065, "elevation": 1650, "type": "Capital"},
    {"name": "Namchi", "state": "Sikkim", "country": "India", "latitude": 27.1667, "longitude": 88.3500, "elevation": 1315, "type": "District HQ"},
    {"name": "Geyzing", "state": "Sikkim", "country": "India", "latitude": 27.2833, "longitude": 88.2500, "elevation": 1900, "type": "District HQ"},
    {"name": "Mangan", "state": "Sikkim", "country": "India", "latitude": 27.5000, "longitude": 88.5333, "elevation": 956, "type": "North Sikkim Pass"},
    {"name": "Rangpo", "state": "Sikkim", "country": "India", "latitude": 27.1772, "longitude": 88.5292, "elevation": 330, "type": "Lifeline Entry Gate"},

    # TRIPURA
    {"name": "Agartala", "state": "Tripura", "country": "India", "latitude": 23.8315, "longitude": 91.2868, "elevation": 12, "type": "Capital"},
    {"name": "Udaipur", "state": "Tripura", "country": "India", "latitude": 23.5333, "longitude": 91.4833, "elevation": 21, "type": "District HQ"},
    {"name": "Dharmanagar", "state": "Tripura", "country": "India", "latitude": 24.3833, "longitude": 92.1667, "elevation": 21, "type": "Railhead Junction"},
    {"name": "Kailashahar", "state": "Tripura", "country": "India", "latitude": 24.3328, "longitude": 92.0078, "elevation": 29, "type": "District HQ"},
    {"name": "Belonia", "state": "Tripura", "country": "India", "latitude": 23.2500, "longitude": 91.4500, "elevation": 23, "type": "South Hub"},
]


class GeocodingService:
    """
    Geocoding search service using Open-Meteo Geocoding API + Preloaded NER Catalog.
    Endpoint: https://geocoding-api.open-meteo.com/v1/search
    """

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.OPEN_METEO_GEOCODING_URL

    async def search_locations(self, query: str, limit: int = 8) -> List[Dict[str, Any]]:
        q_norm = query.strip().lower()
        if not q_norm:
            return NER_PRELOADED_LOCATIONS[:limit]

        # 1. Match against local high-fidelity NER catalog
        local_matches = [
            loc for loc in NER_PRELOADED_LOCATIONS
            if q_norm in loc["name"].lower()
            or q_norm in loc["state"].lower()
            or q_norm in loc.get("type", "").lower()
        ]

        if len(local_matches) >= limit:
            return local_matches[:limit]

        # 2. Query Open-Meteo Geocoding API for online expansion
        api_matches = []
        try:
            params = {
                "name": query.strip(),
                "count": limit,
                "language": "en",
                "format": "json",
            }
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get(self.base_url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    results = data.get("results", [])
                    for r in results:
                        # Prioritize Indian / NER locations
                        name = r.get("name", "")
                        admin1 = r.get("admin1", "Northeast Region")
                        country = r.get("country", "India")
                        lat = r.get("latitude", 0.0)
                        lng = r.get("longitude", 0.0)
                        elev = r.get("elevation", 100)

                        # Exclude duplicate coordinates if already in local_matches
                        if not any(abs(m["latitude"] - lat) < 0.02 and abs(m["longitude"] - lng) < 0.02 for m in local_matches):
                            api_matches.append({
                                "name": name,
                                "state": admin1,
                                "country": country,
                                "latitude": lat,
                                "longitude": lng,
                                "elevation": elev,
                                "type": "Online Search",
                            })
        except Exception as exc:
            logger.warning(f"Open-Meteo geocoding query failed: {exc}")

        combined = local_matches + api_matches
        return combined[:limit]


geocoding_service = GeocodingService()
