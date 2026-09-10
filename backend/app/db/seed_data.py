from datetime import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models.district import District
from app.models.road import Road
from app.models.bridge import Bridge
from app.models.vehicle import Vehicle
from app.models.vehicle_position import VehiclePosition
from app.models.route import Route
from app.models.weather import WeatherObservation
from app.models.hazard import Hazard
from app.models.field_report import FieldReport
from app.models.alert import Alert
from app.models.supply import SupplyManifest
from app.models.district_inventory import DistrictInventory
from app.models.optimization_run import OptimizationRun
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.safe_hub import SafeHub


# Realistic North East road geometry seeds (GeoJSON LineString [lng, lat])
GUWAHATI_SHILLONG_COORDS = [
    [91.7362, 26.1445],  # Guwahati Khanapara
    [91.7820, 26.0850],  # Jorabat
    [91.8210, 25.9620],  # Burnihat
    [91.8740, 25.8650],  # Nongpoh
    [91.9050, 25.7320],  # Umsning
    [91.8980, 25.6600],  # Umiam Lake / Barapani
    [91.8933, 25.5788],  # Shillong
]

SHILLONG_SILCHAR_COORDS = [
    [91.8933, 25.5788],  # Shillong
    [92.0520, 25.5100],  # Mawryngkneng
    [92.2038, 25.4485],  # Jowai
    [92.3120, 25.3850],  # Khliehriat
    [92.3550, 25.3120],  # Ladrymbai (Hazard point)
    [92.4200, 25.2100],  # Sonapur Tunnel / Malidhar
    [92.5500, 25.0500],  # Umrangso / Kalain
    [92.6800, 24.9500],  # Badarpur
    [92.7789, 24.8333],  # Silchar
]

GUWAHATI_SILCHAR_PRIMARY_COORDS = GUWAHATI_SHILLONG_COORDS + SHILLONG_SILCHAR_COORDS[1:]

GUWAHATI_NAGAON_HAFLONG_SILCHAR_ALTERNATE_COORDS = [
    [91.7362, 26.1445],  # Guwahati
    [91.8500, 26.1800],  # Sonapur
    [92.0200, 26.1900],  # Jagiroad
    [92.3300, 26.2400],  # Raha
    [92.6840, 26.3452],  # Nagaon Junction
    [92.8500, 26.1500],  # Dabaka
    [93.1700, 25.7500],  # Lumding
    [93.1200, 25.4800],  # Maibang
    [93.0200, 25.1700],  # Haflong
    [92.8900, 24.9900],  # Harangajao
    [92.7789, 24.8333],  # Silchar
]

# Flood Polygon over Ladrymbai / NH-6 East Jaintia Hills Sector
FLOOD_POLYGON_COORDS = [
    [
        [92.3000, 25.3600],
        [92.4100, 25.3600],
        [92.4300, 25.2600],
        [92.3200, 25.2600],
        [92.3000, 25.3600],
    ]
]


def seed_database(db: Session):
    # Schema compatibility for SQLite
    try:
        db.execute(text("ALTER TABLE field_reports ADD COLUMN evidence_source VARCHAR DEFAULT 'NO_EVIDENCE_IMAGE'"))
        db.commit()
    except Exception:
        db.rollback()

    try:
        db.execute(text("ALTER TABLE field_reports ADD COLUMN idempotency_key VARCHAR"))
        db.commit()
    except Exception:
        db.rollback()

    # 1. Districts
    if not db.query(District).first():
        districts = [
            District(id="DIST-AS-KAMRUP", name="Kamrup Metropolitan", state="Assam", hq_name="Guwahati", latitude=26.1445, longitude=91.7362, connectivity_status="CONNECTED"),
            District(id="DIST-ML-EKHASI", name="East Khasi Hills", state="Meghalaya", hq_name="Shillong", latitude=25.5788, longitude=91.8933, connectivity_status="CONNECTED"),
            District(id="DIST-ML-EJAINTIA", name="East Jaintia Hills", state="Meghalaya", hq_name="Khliehriat", latitude=25.3560, longitude=92.3680, connectivity_status="WATCH"),
            District(id="DIST-AS-CACHAR", name="Cachar", state="Assam", hq_name="Silchar", latitude=24.8333, longitude=92.7789, connectivity_status="CONNECTED"),
            District(id="DIST-AS-NAGAON", name="Nagaon", state="Assam", hq_name="Nagaon", latitude=26.3452, longitude=92.6840, connectivity_status="CONNECTED"),
            District(id="DIST-AS-JORHAT", name="Jorhat", state="Assam", hq_name="Jorhat", latitude=26.7509, longitude=94.2037, connectivity_status="CONNECTED"),
            District(id="DIST-AS-DIMA", name="Dima Hasao", state="Assam", hq_name="Haflong", latitude=25.1700, longitude=93.0200, connectivity_status="CONNECTED"),
        ]
        db.add_all(districts)

    # 2. Roads
    if not db.query(Road).first():
        roads = [
            Road(
                id="ROAD-NH06-GHY-SHL",
                road_name="NH-6 Guwahati-Shillong Expressway",
                road_type="NATIONAL_HIGHWAY",
                origin="Guwahati",
                destination="Shillong",
                distance_km=98.5,
                base_travel_time_min=150.0,
                current_status="OPEN",
                traffic_level="NORMAL",
                accessibility_score=95.0,
                terrain_type="HILLY",
                geometry_geojson=GUWAHATI_SHILLONG_COORDS,
            ),
            Road(
                id="ROAD-NH06-SHL-SIL",
                road_name="NH-6 Shillong-Jowai-Silchar Corridor",
                road_type="NATIONAL_HIGHWAY",
                origin="Shillong",
                destination="Silchar",
                distance_km=218.0,
                base_travel_time_min=390.0,
                current_status="OPEN",
                traffic_level="NORMAL",
                accessibility_score=88.0,
                terrain_type="HILLY",
                geometry_geojson=SHILLONG_SILCHAR_COORDS,
            ),
            Road(
                id="ROAD-NH27-GHY-NAG",
                road_name="NH-27 Guwahati-Nagaon 4-Lane Highway",
                road_type="NATIONAL_HIGHWAY",
                origin="Guwahati",
                destination="Nagaon",
                distance_km=122.0,
                base_travel_time_min=130.0,
                current_status="OPEN",
                traffic_level="NORMAL",
                accessibility_score=98.0,
                terrain_type="PLAIN",
                geometry_geojson=GUWAHATI_NAGAON_HAFLONG_SILCHAR_ALTERNATE_COORDS[:5],
            ),
            Road(
                id="ROAD-NH54-NAG-SIL",
                road_name="NH-54/NH-627 Nagaon-Haflong-Silchar Alternate Corridor",
                road_type="NATIONAL_HIGHWAY",
                origin="Nagaon",
                destination="Silchar",
                distance_km=225.0,
                base_travel_time_min=360.0,
                current_status="OPEN",
                traffic_level="LOW",
                accessibility_score=92.0,
                terrain_type="HILLY",
                geometry_geojson=GUWAHATI_NAGAON_HAFLONG_SILCHAR_ALTERNATE_COORDS[4:],
            ),
        ]
        db.add_all(roads)

    # 3. Bridges
    if not db.query(Bridge).first():
        bridges = [
            Bridge(
                id="BRG-SARAIGHAT-01",
                road_id="ROAD-NH27-GHY-NAG",
                name="Saraighat Brahmaputra Bridge",
                river_name="Brahmaputra",
                latitude=26.1778,
                longitude=91.6961,
                accessibility_status="OPEN",
                load_limit_tons=50.0,
                water_level_m=48.2,
                danger_water_level_m=51.4,
                clearance_status="NORMAL",
                geometry_geojson={"type": "Point", "coordinates": [91.6961, 26.1778]},
            ),
            Bridge(
                id="BRG-DWARKA-JOWAI",
                road_id="ROAD-NH06-SHL-SIL",
                name="Myntdu River Bridge (Jowai)",
                river_name="Myntdu",
                latitude=25.4420,
                longitude=92.2150,
                accessibility_status="OPEN",
                load_limit_tons=35.0,
                water_level_m=8.5,
                danger_water_level_m=12.0,
                clearance_status="NORMAL",
                geometry_geojson={"type": "Point", "coordinates": [92.2150, 25.4420]},
            ),
            Bridge(
                id="BRG-LUBHA-SONAPUR",
                road_id="ROAD-NH06-SHL-SIL",
                name="Lubha Suspension Bridge (Sonapur)",
                river_name="Lubha",
                latitude=25.2150,
                longitude=92.4180,
                accessibility_status="OPEN",
                load_limit_tons=30.0,
                water_level_m=11.2,
                danger_water_level_m=14.5,
                clearance_status="NORMAL",
                geometry_geojson={"type": "Point", "coordinates": [92.4180, 25.2150]},
            ),
            Bridge(
                id="BRG-SADARGHAT-SILCHAR",
                road_id="ROAD-NH06-SHL-SIL",
                name="Sadarghat Barak River Bridge",
                river_name="Barak",
                latitude=24.8390,
                longitude=92.8020,
                accessibility_status="OPEN",
                load_limit_tons=45.0,
                water_level_m=19.1,
                danger_water_level_m=20.5,
                clearance_status="NORMAL",
                geometry_geojson={"type": "Point", "coordinates": [92.8020, 24.8390]},
            ),
        ]
        db.add_all(bridges)

    # 4. Multi-Vehicle Convoy
    if not db.query(Vehicle).first():
        vehicles = [
            Vehicle(
                id="NER-MED-01",
                vehicle_number="AS-01-GC-4482",
                cargo_type="EMERGENCY_MEDICINE",
                priority="CRITICAL",
                capacity_tons=8.5,
                current_lat=GUWAHATI_SILCHAR_PRIMARY_COORDS[0][1],
                current_lng=GUWAHATI_SILCHAR_PRIMARY_COORDS[0][0],
                speed_kmh=48.0,
                heading_deg=145.0,
                current_route_id="ROUTE-PRIMARY-01",
                status="EN_ROUTE",
                origin="Guwahati Integrated Logistics Hub",
                destination="Silchar Civil Hospital & Regional Medical Store",
            ),
            Vehicle(
                id="NER-TRK-01",
                vehicle_number="AS-01-TR-4483",
                cargo_type="EMERGENCY_MEDICINE",
                priority="CRITICAL",
                capacity_tons=8.5,
                current_lat=GUWAHATI_SILCHAR_PRIMARY_COORDS[0][1],
                current_lng=GUWAHATI_SILCHAR_PRIMARY_COORDS[0][0],
                speed_kmh=48.0,
                heading_deg=145.0,
                current_route_id="ROUTE-PRIMARY-01",
                status="EN_ROUTE",
                origin="Guwahati Integrated Logistics Hub",
                destination="Silchar Civil Hospital & Regional Medical Store",
            ),
            Vehicle(
                id="NER-FOOD-02",
                vehicle_number="AS-01-FD-2091",
                cargo_type="FOOD_GRAINS",
                priority="HIGH",
                capacity_tons=15.0,
                current_lat=GUWAHATI_SILCHAR_PRIMARY_COORDS[1][1],
                current_lng=GUWAHATI_SILCHAR_PRIMARY_COORDS[1][0],
                speed_kmh=52.0,
                heading_deg=145.0,
                current_route_id="ROUTE-PRIMARY-01",
                status="EN_ROUTE",
                origin="Guwahati FCI Storage Depot",
                destination="Silchar Regional Food Grain Depot",
            ),
            Vehicle(
                id="NER-RELIEF-03",
                vehicle_number="AS-01-RF-5530",
                cargo_type="RELIEF_KITS",
                priority="HIGH",
                capacity_tons=10.0,
                current_lat=GUWAHATI_NAGAON_HAFLONG_SILCHAR_ALTERNATE_COORDS[1][1],
                current_lng=GUWAHATI_NAGAON_HAFLONG_SILCHAR_ALTERNATE_COORDS[1][0],
                speed_kmh=55.0,
                heading_deg=110.0,
                current_route_id="ROUTE-ALTERNATE-01",
                status="EN_ROUTE",
                origin="Guwahati ASDMA Warehouse",
                destination="Haflong Disaster Relief Distribution Centre",
            ),
            Vehicle(
                id="NER-CON-04",
                vehicle_number="AS-01-CN-8812",
                cargo_type="CONSTRUCTION_MATERIALS",
                priority="NORMAL",
                capacity_tons=20.0,
                current_lat=GUWAHATI_SILCHAR_PRIMARY_COORDS[2][1],
                current_lng=GUWAHATI_SILCHAR_PRIMARY_COORDS[2][0],
                speed_kmh=42.0,
                heading_deg=145.0,
                current_route_id="ROUTE-PRIMARY-01",
                status="EN_ROUTE",
                origin="Guwahati Heavy Freight Terminal",
                destination="Silchar Infrastructure Development Site",
            ),
        ]
        db.add_all(vehicles)

    # 5. Routes
    if not db.query(Route).first():
        primary_route = Route(
            id="ROUTE-PRIMARY-01",
            route_name="Primary: NH-6 Guwahati - Shillong - Silchar Corridor",
            origin="Guwahati",
            destination="Silchar",
            route_type="PRIMARY",
            distance_km=316.5,
            estimated_duration_min=540.0,
            polyline_geojson=GUWAHATI_SILCHAR_PRIMARY_COORDS,
            is_active=True,
            is_blocked=False,
            source_engine="OSRM",
        )
        alternate_route = Route(
            id="ROUTE-ALTERNATE-01",
            route_name="Alternate: NH-27/NH-54 Guwahati - Nagaon - Haflong - Silchar Bypass",
            origin="Guwahati",
            destination="Silchar",
            route_type="ALTERNATE",
            distance_km=347.0,
            estimated_duration_min=490.0,
            polyline_geojson=GUWAHATI_NAGAON_HAFLONG_SILCHAR_ALTERNATE_COORDS,
            is_active=False,
            is_blocked=False,
            source_engine="NETWORKX_FALLBACK",
        )
        db.add_all([primary_route, alternate_route])

    # 6. Weather
    if not db.query(WeatherObservation).first():
        weather_obs = [
            WeatherObservation(
                location_name="Guwahati Hub",
                latitude=26.1445,
                longitude=91.7362,
                temperature_c=28.4,
                precipitation_mm=2.1,
                precipitation_probability=20.0,
                soil_moisture_m3_m3=0.28,
                wind_speed_kmh=12.0,
                weather_condition="Partly Cloudy",
                warning_level="GREEN",
                source="OPEN_METEO",
            ),
            WeatherObservation(
                location_name="Shillong Highlands",
                latitude=25.5788,
                longitude=91.8933,
                temperature_c=19.2,
                precipitation_mm=14.5,
                precipitation_probability=65.0,
                soil_moisture_m3_m3=0.42,
                wind_speed_kmh=18.0,
                weather_condition="Light Rain & Fog",
                warning_level="YELLOW",
                source="OPEN_METEO",
            ),
            WeatherObservation(
                location_name="East Jaintia Hills / Ladrymbai",
                latitude=25.3120,
                longitude=92.3550,
                temperature_c=22.0,
                precipitation_mm=85.0,
                precipitation_probability=95.0,
                soil_moisture_m3_m3=0.58,
                wind_speed_kmh=29.0,
                weather_condition="Heavy Downpour & Flash Flood Risk",
                warning_level="ORANGE",
                source="OPEN_METEO",
            ),
            WeatherObservation(
                location_name="Silchar Barak Valley",
                latitude=24.8333,
                longitude=92.7789,
                temperature_c=31.0,
                precipitation_mm=8.0,
                precipitation_probability=40.0,
                soil_moisture_m3_m3=0.38,
                wind_speed_kmh=8.0,
                weather_condition="Humid with Scattered Showers",
                warning_level="GREEN",
                source="OPEN_METEO",
            ),
        ]
        db.add_all(weather_obs)

    # 7. Hazard
    if not db.query(Hazard).first():
        flood_hazard = Hazard(
            id="HAZARD-FLOOD-LADRYMBAI",
            hazard_type="FLOOD",
            severity="CRITICAL",
            location_name="NH-6 Ladrymbai - Sonapur Tunnel Sector (East Jaintia Hills)",
            center_lat=25.3120,
            center_lng=92.3550,
            radius_km=7.5,
            polygon_geojson=FLOOD_POLYGON_COORDS,
            affected_road_ids=["ROAD-NH06-SHL-SIL"],
            affected_bridge_ids=["BRG-LUBHA-SONAPUR"],
            is_active=False,
            is_simulated=True,
            description="Controlled SIH26002 Scenario: Severe flash flood and landslide triggered by cloudburst on NH-6 sector.",
        )
        db.add(flood_hazard)

    # 8. Field Reports
    if not db.query(FieldReport).first():
        field_reports = [
            FieldReport(
                id="REP-2026-001",
                officer_name="Inspector Debojit Barman",
                department="Assam State Disaster Management Authority (ASDMA)",
                district="Cachar",
                location_name="NH-6 Sonapur Tunnel Section (km 142)",
                latitude=25.2100,
                longitude=92.4200,
                incident_type="FLOOD",
                severity="CRITICAL",
                description="Flash flood overtopping highway by +1.4m. Heavy mud slurry wash across 140m road section. Impassable for standard convoys.",
                photo_url="/static/uploads/flooded_road_demo.jpg",
                evidence_source="FIELD_UPLOAD",
                sync_state="VERIFIED",
            ),
            FieldReport(
                id="REP-2026-002",
                officer_name="Er. M. Sangma",
                department="PWD (Roads & Bridges) Meghalaya",
                district="East Jaintia Hills",
                location_name="Lubha Suspension Bridge Pier #3",
                latitude=25.2050,
                longitude=92.4350,
                incident_type="BRIDGE_DAMAGE",
                severity="HIGH",
                description="High river current caused 0.8m scour around pier footing. Load restriction recommended for vehicles exceeding 20 tonnes.",
                photo_url="/static/uploads/bridge_damage_demo.jpg",
                evidence_source="FIELD_UPLOAD",
                sync_state="VERIFIED",
            ),
            FieldReport(
                id="REP-2026-003",
                officer_name="Officer R. Lyndem",
                department="State Police Traffic Highway Patrol",
                district="East Jaintia Hills",
                location_name="Ladrymbai Hill Cut km 128",
                latitude=25.3120,
                longitude=92.3550,
                incident_type="LANDSLIDE",
                severity="HIGH",
                description="Rockfall and boulder debris partially blocking northbound lane. Single-lane movement active under caution.",
                photo_url="/static/uploads/landslide_demo.jpg",
                evidence_source="FIELD_UPLOAD",
                sync_state="UNDER_REVIEW",
            ),
            FieldReport(
                id="REP-2026-004",
                officer_name="Inspector J. Hazarika",
                department="Guwahati City Traffic Police",
                district="Kamrup Metropolitan",
                location_name="Jorabat NH-6 Toll Plaza",
                latitude=26.0850,
                longitude=91.7820,
                incident_type="WATERLOGGING",
                severity="LOW",
                description="Drainage culvert overflow with 15cm water on shoulder. Highway clear for heavy logistics traffic.",
                photo_url="/static/uploads/heavy_rainfall_demo.jpg",
                evidence_source="FIELD_UPLOAD",
                sync_state="SYNCED",
            ),
        ]
        db.add_all(field_reports)


    # 9. Extended District Inventory Stocks
    if not db.query(DistrictInventory).first():
        inventories = [
            DistrictInventory(
                district_id="DIST-AS-CACHAR",
                district_name="Cachar (Silchar Civil Hospital)",
                supply_type="EMERGENCY_MEDICINE",
                current_stock_units=35.0,
                consumption_rate_per_day=12.0,
                incoming_units=8.5,
                incoming_eta_hours=8.0,
                critical_threshold_units=40.0,
                stock_status="LOW",
            ),
            DistrictInventory(
                district_id="DIST-AS-CACHAR",
                district_name="Cachar (Silchar Food Grain Depot)",
                supply_type="FOOD_GRAINS",
                current_stock_units=420.0,
                consumption_rate_per_day=25.0,
                incoming_units=50.0,
                incoming_eta_hours=14.0,
                critical_threshold_units=150.0,
                stock_status="ADEQUATE",
            ),
            DistrictInventory(
                district_id="DIST-AS-DIMA",
                district_name="Dima Hasao (Haflong Hospital)",
                supply_type="EMERGENCY_MEDICINE",
                current_stock_units=55.0,
                consumption_rate_per_day=5.0,
                incoming_units=0.0,
                incoming_eta_hours=0.0,
                critical_threshold_units=20.0,
                stock_status="ADEQUATE",
            ),
            DistrictInventory(
                district_id="DIST-AS-DIMA",
                district_name="Dima Hasao (Haflong Relief Centre)",
                supply_type="RELIEF_KITS",
                current_stock_units=120.0,
                consumption_rate_per_day=18.0,
                incoming_units=10.0,
                incoming_eta_hours=6.5,
                critical_threshold_units=50.0,
                stock_status="ADEQUATE",
            ),
        ]
        db.add_all(inventories)

    # 10. Supply Manifests
    if not db.query(SupplyManifest).first():
        supplies = [
            SupplyManifest(
                id="SUP-MED-001",
                supply_type="EMERGENCY_MEDICINE",
                name="Emergency ICU Life-Saving Medicines & Vaccines",
                quantity_units=8.5,
                unit_measure="Metric Tons",
                priority="CRITICAL",
                origin_depot="Guwahati Integrated Logistics Hub",
                dest_district="Cachar (Silchar Civil Hospital)",
                assigned_vehicle_id="NER-MED-01",
                status="IN_TRANSIT",
                required_by_hours=10.0,
            ),
            SupplyManifest(
                id="SUP-GRAIN-002",
                supply_type="FOOD_GRAINS",
                name="Essential Rice & Pulses Relief Packets",
                quantity_units=15.0,
                unit_measure="Metric Tons",
                priority="HIGH",
                origin_depot="Guwahati FCI Storage Depot",
                dest_district="Cachar (Silchar Regional Food Grain Depot)",
                assigned_vehicle_id="NER-FOOD-02",
                status="IN_TRANSIT",
                required_by_hours=24.0,
            ),
            SupplyManifest(
                id="SUP-RELIEF-003",
                supply_type="RELIEF_KITS",
                name="Monsoon Tarpaulins, Water Purifiers & Family Survival Kits",
                quantity_units=10.0,
                unit_measure="Metric Tons",
                priority="HIGH",
                origin_depot="Guwahati ASDMA Warehouse",
                dest_district="Dima Hasao (Haflong Relief Centre)",
                assigned_vehicle_id="NER-RELIEF-03",
                status="IN_TRANSIT",
                required_by_hours=18.0,
            ),
            SupplyManifest(
                id="SUP-CON-004",
                supply_type="CONSTRUCTION_MATERIALS",
                name="Cement, Structural Steel & Geo-Textile Reinforcement",
                quantity_units=20.0,
                unit_measure="Metric Tons",
                priority="NORMAL",
                origin_depot="Guwahati Heavy Freight Terminal",
                dest_district="Cachar (Silchar Infrastructure Site)",
                assigned_vehicle_id="NER-CON-04",
                status="IN_TRANSIT",
                required_by_hours=48.0,
            ),
        ]
        db.add_all(supplies)

    # 11. Alert
    if not db.query(Alert).first():
        alert = Alert(
            id="ALT-INIT-001",
            alert_type="HIGH_RISK_CORRIDOR",
            severity="WARNING",
            title="Monsoon Advisory: NH-6 Meghalaya Sector",
            message="East Jaintia Hills under yellow watch. High soil saturation detected on Ladrymbai-Sonapur ghats.",
            entity_id="ROAD-NH06-SHL-SIL",
            recommended_action="Maintain high alert; monitor river Lubha bridge clearance level.",
            is_active=True,
        )
        db.add(alert)

    # 12. Optimization Run Benchmark Record
    if not db.query(OptimizationRun).first():
        opt_run = OptimizationRun(
            id="OPT-BENCHMARK-INIT",
            algorithm="OR_TOOLS_CVRP_CONTEXT_AWARE",
            vehicle_count=4,
            shipment_count=4,
            total_distance_km=1230.5,
            total_predicted_time_min=1890.0,
            critical_on_time=4,
            delayed_shipments=0,
            unserved_shipments=0,
            average_risk_score=0.18,
            vehicle_utilization_pct=88.4,
            assignments_json=[
                {"vehicle_id": "NER-MED-01", "supply_id": "SUP-MED-001", "route": "ROUTE-PRIMARY-01", "priority": "CRITICAL"},
                {"vehicle_id": "NER-FOOD-02", "supply_id": "SUP-GRAIN-002", "route": "ROUTE-PRIMARY-01", "priority": "HIGH"},
                {"vehicle_id": "NER-RELIEF-03", "supply_id": "SUP-RELIEF-003", "route": "ROUTE-ALTERNATE-01", "priority": "HIGH"},
                {"vehicle_id": "NER-CON-04", "supply_id": "SUP-CON-004", "route": "ROUTE-PRIMARY-01", "priority": "NORMAL"},
            ],
            benchmark_comparison={
                "baseline_unconstrained_cost": 2450.0,
                "context_aware_optimized_cost": 1920.0,
                "risk_reduction_pct": 34.2,
            },
        )
        db.add(opt_run)

    # 13. System Users (7 RBAC Roles)
    if not db.query(User).first():

        users = [
            User(
                id="USR-001-ADMIN",
                username="admin_rajeshwar",
                name="Rajeshwar Baruah",
                email="rajeshwar.baruah@mdoner.gov.in",
                role="ADMIN",
                department="Ministry of Development of North Eastern Region (MDoNER)",
                organization_district="National Command / New Delhi & Guwahati",
                avatar_initials="RB",
                is_active=True,
            ),
            User(
                id="USR-002-CMD-OPERATOR",
                username="operator_siva",
                name="Siva Paparao Medisetti",
                email="siva.medisetti@ner.logistics.gov.in",
                role="COMMAND_OPERATOR",
                department="NER Regional Operations Center",
                organization_district="Guwahati HQ / Regional Command",
                avatar_initials="SM",
                is_active=True,
            ),
            User(
                id="USR-003-DIST-OFFICER",
                username="dm_cachar",
                name="Dr. B. K. Goswami, IAS",
                email="dm-cachar@assam.gov.in",
                role="DISTRICT_OFFICER",
                department="District Disaster Management Authority (DDMA)",
                organization_district="Cachar District Emergency Ops Center",
                avatar_initials="BG",
                is_active=True,
            ),
            User(
                id="USR-004-FLEET-MGR",
                username="fleet_vikram",
                name="Capt. Vikramaditya Deb",
                email="fleet.command@ner-logistics.org",
                role="FLEET_MANAGER",
                department="Regional Transport & Convoy Command",
                organization_district="Inter-State Logistics Wing",
                avatar_initials="VD",
                is_active=True,
            ),
            User(
                id="USR-005-FIELD-OFFICER",
                username="field_debojit",
                name="Er. Debojit Barman",
                email="debojit.barman@asdma.gov.in",
                role="FIELD_OFFICER",
                department="PWD (Roads & Bridges) Field Recon",
                organization_district="Barak Valley & East Jaintia Recon Sector",
                avatar_initials="DB",
                is_active=True,
            ),
            User(
                id="USR-006-SUPPLY-MGR",
                username="supply_roy",
                name="Dr. H. L. Roy",
                email="director.health@cachar.nic.in",
                role="SUPPLY_MANAGER",
                department="Health & Family Welfare Emergency Logistics",
                organization_district="Silchar Civil Hospital & Regional Medical Store",
                avatar_initials="HR",
                is_active=True,
            ),
            User(
                id="USR-007-ANALYST",
                username="analyst_ananya",
                name="Ananya Hazarika",
                email="ananya.hazarika@ner-analytics.org",
                role="ANALYST_VIEWER",
                department="Operations Research & Performance Review",
                organization_district="Regional Analytics Division",
                avatar_initials="AH",
                is_active=True,
            ),
        ]
        db.add_all(users)

    # 14. Regional Safe Hubs & Relief Staging Depots
    if not db.query(SafeHub).first():
        safe_hubs = [
            SafeHub(
                id="HUB-GHY-01",
                name="Guwahati Central Lifeline Logistics Depot",
                hub_type="EMERGENCY_LOGISTICS_HUB",
                state="Assam",
                district="Kamrup Metropolitan",
                latitude=26.1445,
                longitude=91.7362,
                elevation_m=55.0,
                capacity_tons=1500.0,
                current_occupancy_pct=42.0,
                status="ACTIVE",
                services=["COLD_STORAGE", "HELIPAD", "HEAVY_FREIGHT", "MEDICINE_BUFFER"],
                contact_phone="+91-361-2234501",
            ),
            SafeHub(
                id="HUB-NAG-02",
                name="Nagaon Regional Relief Staging Hub",
                hub_type="STAGING_AREA",
                state="Assam",
                district="Nagaon",
                latitude=26.3452,
                longitude=92.6840,
                elevation_m=60.0,
                capacity_tons=900.0,
                current_occupancy_pct=35.0,
                status="ACTIVE",
                services=["FOUR_LANE_ACCESS", "FUEL_STATION", "FOOD_DEPOT"],
                contact_phone="+91-3672-235112",
            ),
            SafeHub(
                id="HUB-HFL-03",
                name="Haflong High-Ground Mountain Warehouse",
                hub_type="WAREHOUSE",
                state="Assam",
                district="Dima Hasao",
                latitude=25.1700,
                longitude=93.0200,
                elevation_m=680.0,
                capacity_tons=650.0,
                current_occupancy_pct=28.0,
                status="ACTIVE",
                services=["HIGH_GROUND_SECURE", "MEDICINE_STORAGE", "EMERGENCY_RATION"],
                contact_phone="+91-3673-236402",
            ),
            SafeHub(
                id="HUB-SHL-04",
                name="Shillong Plateau Disaster Relief Center",
                hub_type="RELIEF_CENTER",
                state="Meghalaya",
                district="East Khasi Hills",
                latitude=25.5788,
                longitude=91.8933,
                elevation_m=1525.0,
                capacity_tons=800.0,
                current_occupancy_pct=52.0,
                status="ACTIVE",
                services=["BLOOD_BANK", "ICU_BACKUP", "HELIPAD", "DISASTER_SHELTER"],
                contact_phone="+91-364-2224103",
            ),
            SafeHub(
                id="HUB-SIL-05",
                name="Silchar Civil Emergency Depot & Medical Store",
                hub_type="HOSPITAL",
                state="Assam",
                district="Cachar",
                latitude=24.8239,
                longitude=92.8012,
                elevation_m=25.0,
                capacity_tons=950.0,
                current_occupancy_pct=88.0,
                status="RESTRICTED",
                services=["ICU_LIFELINE", "VACCINE_COLD_CHAIN", "OXYGEN_GENERATION"],
                contact_phone="+91-3842-245100",
            ),
            SafeHub(
                id="HUB-DMP-06",
                name="Dimapur Railhead Logistics Transit Center",
                hub_type="EMERGENCY_LOGISTICS_HUB",
                state="Nagaland",
                district="Dimapur",
                latitude=25.9068,
                longitude=93.7271,
                elevation_m=145.0,
                capacity_tons=1800.0,
                current_occupancy_pct=38.0,
                status="ACTIVE",
                services=["RAILWAY_SIDINGS", "CONTAINER_YARD", "FUEL_TERMINAL"],
                contact_phone="+91-3862-227091",
            ),
            SafeHub(
                id="HUB-AGT-07",
                name="Agartala State Disaster Logistics Hub",
                hub_type="WAREHOUSE",
                state="Tripura",
                district="West Tripura",
                latitude=23.8315,
                longitude=91.2868,
                elevation_m=12.0,
                capacity_tons=850.0,
                current_occupancy_pct=40.0,
                status="ACTIVE",
                services=["CROSS_BORDER_FACILITY", "FOOD_GRAINS", "WATER_PURIFICATION"],
                contact_phone="+91-381-2326550",
            ),
        ]
        db.add_all(safe_hubs)

    # 15. Audit Logs
    if not db.query(AuditLog).first():
        initial_logs = [
            AuditLog(
                id="AUD-INIT-001",
                user_id="USR-001-ADMIN",
                user_name="Rajeshwar Baruah",
                role="ADMIN",
                action="SYSTEM_INITIALIZATION",
                entity_type="SYSTEM",
                entity_id="SIH26002-CORE",
                details="Platform v5.0 initialized with RBAC security and multi-provider fallback hierarchy.",
                metadata_json={"version": "5.0.0-PROD"},
            ),
            AuditLog(
                id="AUD-INIT-002",
                user_id="USR-005-FIELD-OFFICER",
                user_name="Er. Debojit Barman",
                role="FIELD_OFFICER",
                action="CREATE_FIELD_REPORT",
                entity_type="FIELD_REPORT",
                entity_id="REP-2026-001",
                details="Reported flood inundation at Sonapur Tunnel section with photo evidence.",
                metadata_json={"district": "Cachar", "severity": "CRITICAL"},
            ),
            AuditLog(
                id="AUD-INIT-003",
                user_id="USR-003-DIST-OFFICER",
                user_name="Dr. B. K. Goswami, IAS",
                role="DISTRICT_OFFICER",
                action="VERIFY_FIELD_REPORT",
                entity_type="FIELD_REPORT",
                entity_id="REP-2026-001",
                details="Verified Sonapur flood report; activated emergency impact cascade.",
                metadata_json={"sync_state": "VERIFIED"},
            ),
        ]
        db.add_all(initial_logs)

    db.commit()

