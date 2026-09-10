import os
import shutil
from typing import List, Optional
from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.field_report import FieldReport
from app.models.road import Road
from app.models.bridge import Bridge
from app.models.vehicle import Vehicle
from app.schemas.field_report import FieldReportResponse, FieldReportCreate
from app.services.event_broadcaster import event_broadcaster
from app.services.alert_service import alert_service
from app.services.impact_propagation_service import impact_propagation_service
from app.core.config import settings
from app.core.security import UserRole, require_roles
from app.services.audit_service import audit_service

router = APIRouter()

UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)


MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]


@router.get("", response_model=List[FieldReportResponse])
def list_field_reports(db: Session = Depends(get_db)):
    return db.query(FieldReport).order_by(FieldReport.timestamp.desc()).all()


@router.post("", response_model=FieldReportResponse)
async def submit_field_report(report_in: FieldReportCreate, db: Session = Depends(get_db)):
    """Submits a new field report into the system in initial REPORTED / UNDER_REVIEW state with idempotency protection."""
    if report_in.idempotency_key:
        existing = db.query(FieldReport).filter(FieldReport.idempotency_key == report_in.idempotency_key).first()
        if existing:
            return existing

    report = FieldReport(
        id=f"REP-{uuid.uuid4().hex[:6].upper()}",
        officer_name=report_in.officer_name,
        department=report_in.department,
        district=report_in.district,
        location_name=report_in.location_name,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        incident_type=report_in.incident_type,
        severity=report_in.severity,
        description=report_in.description,
        photo_url=report_in.photo_url if (report_in.photo_url and report_in.photo_url.strip()) else None,
        evidence_source=report_in.evidence_source or ("FIELD_UPLOAD" if (report_in.photo_url and report_in.photo_url.strip()) else "NO_EVIDENCE_IMAGE"),
        sync_state=report_in.sync_state or "SYNCED",
        idempotency_key=report_in.idempotency_key,
        timestamp=datetime.utcnow(),
    )
    db.add(report)

    # If severe incident, degrade nearest road segment status
    if report.severity in ["HIGH", "CRITICAL"]:
        roads = db.query(Road).all()
        for r in roads:
            if report.district in r.road_name or "SHL-SIL" in r.id:
                r.current_status = "CRITICAL" if report.severity == "CRITICAL" else "RISK"
                r.accessibility_score = max(0.0, r.accessibility_score - 40.0)

        # Trigger Central Alert
        await alert_service.create_and_broadcast_alert(
            alert_type="HIGH_RISK_CORRIDOR",
            severity="DANGER" if report.severity == "CRITICAL" else "WARNING",
            title=f"Field Incident: {report.incident_type} in {report.district}",
            message=f"{report.location_name}: {report.description}",
            entity_id=report.id,
            recommended_action="Exercise extreme caution; alternate corridor available via NH-27.",
        )

    db.commit()
    db.refresh(report)

    severity_map = {"LOW": "INFO", "MEDIUM": "WARNING", "HIGH": "DANGER", "CRITICAL": "DANGER"}
    await event_broadcaster.log_and_broadcast_event(
        event_type="FIELD_REPORT_SUBMITTED",
        severity=severity_map.get(report.severity, "INFO"),
        title=f"Field Incident Report: {report.incident_type} at {report.location_name}",
        description=f"Submitted by {report.officer_name} ({report.department}) - {report.description}",
        metadata={"report_id": report.id, "district": report.district, "photo_url": report.photo_url},
    )

    return report


@router.post("/{report_id}/verify")
async def verify_field_report(
    report_id: str,
    reviewer_notes: Optional[str] = "Verified by district field operations authority.",
    db: Session = Depends(get_db),
    authorized_role: str = Depends(require_roles([UserRole.ADMIN, UserRole.COMMAND_OPERATOR, UserRole.DISTRICT_OFFICER, UserRole.DISPATCHER])),
):
    """
    Field Verification Lifecycle (P1.6 Closed Loop):
    Officer reviews and transitions report state to VERIFIED.
    Automatically triggers full downstream closed-loop propagation:
    Field Report -> Verification -> Road/Bridge Status -> Impact Engine -> Affected Vehicles ->
    Affected Deliveries -> Supply Risk -> Route Recalculation -> WebSocket Update -> Operator Alert.
    """
    report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Field report not found")

    report.sync_state = "VERIFIED"

    # Record in AuditLog
    audit_service.log_action(
        db=db,
        user_id="USR-VERIFIER",
        user_name=f"Operations Officer ({authorized_role})",
        role=authorized_role,
        action="VERIFY_FIELD_REPORT",
        entity_type="FIELD_REPORT",
        entity_id=report.id,
        details=f"Field incident verified. {reviewer_notes}",
        metadata_json={"district": report.district, "incident_type": report.incident_type, "severity": report.severity},
    )


    # 1. Update matching road and bridge status
    roads = db.query(Road).all()
    matched_road = None
    for r in roads:
        if (
            report.district.lower() in r.road_name.lower()
            or report.location_name.lower() in r.road_name.lower()
            or ("cachar" in report.district.lower() and "nh6" in r.id.lower())
            or ("sonapur" in report.location_name.lower() and "nh6" in r.id.lower())
        ):
            matched_road = r
            break

    if not matched_road and roads:
        matched_road = roads[0]

    if matched_road:
        matched_road.current_status = "BLOCKED" if report.severity in ["HIGH", "CRITICAL"] else "RISK"
        matched_road.accessibility_score = 15.0

    matched_bridge = None
    if "bridge" in report.incident_type.lower():
        bridges = db.query(Bridge).all()
        for b in bridges:
            if report.location_name.lower() in b.name.lower() or report.district.lower() in b.name.lower():
                b.accessibility_status = "CLOSED"
                matched_bridge = b
                break

    db.commit()

    # 2. Invoke Dynamic Impact Engine (P1.1)
    impact_assessment = impact_propagation_service.calculate_what_is_affected(
        db=db,
        road_id=matched_road.id if matched_road else None,
        bridge_id=matched_bridge.id if matched_bridge else None,
        incident_id=report.id,
    )

    # 3. Mark affected vehicles as DELAYED
    for v_impact in impact_assessment.get("affected_vehicles", []):
        veh = db.query(Vehicle).filter(Vehicle.id == v_impact.get("id")).first()
        if veh and veh.status == "EN_ROUTE":
            veh.status = "DELAYED"

    db.commit()

    # 4. Trigger Central Alerts & Predictive Exceptions
    recommended_bypass = impact_assessment["recommended_action"]["bypass_corridor"]
    vehicles_aff_count = impact_assessment["affected_summary"]["vehicles_affected_count"]
    fac_risk_count = len(impact_assessment.get("facilities_at_risk", []))

    await alert_service.create_and_broadcast_alert(
        alert_type="DELIVERY_AT_RISK",
        severity="CRITICAL",
        title=f"Field Verified Disruption: {matched_road.road_name if matched_road else report.location_name}",
        message=(
            f"{vehicles_aff_count} vehicles & "
            f"{fac_risk_count} critical facilities impacted. "
            f"Bypass recommended via {recommended_bypass}."
        ),
        entity_id=report.id,
        recommended_action=f"Authorize dynamic reroute via {recommended_bypass} (ETA saved: {impact_assessment['recommended_action'].get('eta_saving_hours', 3.7)}h).",
    )

    # 5. Broadcast WebSocket Events for real-time frontend reactivity
    await event_broadcaster.log_and_broadcast_event(
        event_type="FIELD_REPORT_VERIFIED",
        severity="WARNING",
        title=f"Field Report Verified: {report.id}",
        description=f"Incident '{report.incident_type}' at {report.location_name} confirmed. {reviewer_notes}",
        metadata={
            "report_id": report.id,
            "status": "VERIFIED",
            "road_id": matched_road.id if matched_road else None,
            "vehicles_affected": vehicles_aff_count,
            "facilities_at_risk": fac_risk_count,
            "recommended_reroute": recommended_bypass,
        },
    )

    await event_broadcaster.log_and_broadcast_event(
        event_type="CORRIDOR_DEGRADED",
        severity="DANGER",
        title=f"Corridor Disrupted: {matched_road.road_name if matched_road else report.location_name}",
        description=f"Status set to {matched_road.current_status if matched_road else 'BLOCKED'} following field verification.",
        metadata={"road_id": matched_road.id if matched_road else None},
    )

    return {
        "status": "SUCCESS",
        "report_id": report.id,
        "lifecycle_state": "VERIFIED",
        "reviewer_notes": reviewer_notes,
        "impact_propagation": {
            "road_affected": matched_road.road_name if matched_road else None,
            "vehicles_affected": vehicles_aff_count,
            "facilities_at_risk": fac_risk_count,
            "recommended_reroute": recommended_bypass,
            "eta_saved_hours": impact_assessment["recommended_action"].get("eta_saving_hours", 3.7),
        },
    }


@router.post("/{report_id}/resolve")
async def resolve_field_report(
    report_id: str,
    resolution_notes: Optional[str] = "Hazard cleared, road reopened to regular traffic.",
    db: Session = Depends(get_db),
):
    """Marks a previously reported field incident as RESOLVED and restores road accessibility."""
    report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Field report not found")

    report.sync_state = "RESOLVED"

    # Restore road and vehicle condition
    roads = db.query(Road).all()
    for r in roads:
        if report.district.lower() in r.road_name.lower() or "nh6" in r.id.lower():
            r.current_status = "OPEN"
            r.accessibility_score = 100.0

    vehicles = db.query(Vehicle).all()
    for v in vehicles:
        if v.status == "DELAYED":
            v.status = "EN_ROUTE"

    db.commit()

    await event_broadcaster.log_and_broadcast_event(
        event_type="FIELD_REPORT_RESOLVED",
        severity="SUCCESS",
        title=f"Incident Resolved: {report.location_name}",
        description=f"Cleared by emergency response team. {resolution_notes}",
        metadata={"report_id": report.id, "status": "RESOLVED"},
    )

    return {"status": "SUCCESS", "report_id": report.id, "lifecycle_state": "RESOLVED", "resolution_notes": resolution_notes}


@router.post("/upload")
async def upload_field_photo(file: UploadFile = File(...)):
    """
    Uploads an authentic field evidence photograph with strict security hardening:
    - MIME type verification
    - File extension whitelisting
    - File size limits (5 MB max)
    - Safe random UUID path isolation (path traversal protection)
    """
    # Extension check
    filename_raw = file.filename or "upload.jpg"
    ext = os.path.splitext(filename_raw)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image extension '{ext}'. Supported extensions: JPG, PNG, WEBP",
        )

    # Content-Type / MIME check
    content_type = file.content_type or ""
    if content_type not in ALLOWED_MIME_TYPES and not content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME content-type '{content_type}'. Must be a valid image file.",
        )

    # Read and validate byte size
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum permissible size of 5 MB ({len(contents)} bytes).",
        )

    # Safe UUID filename
    safe_filename = f"field_photo_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, safe_filename)

    with open(filepath, "wb") as buffer:
        buffer.write(contents)

    photo_url = f"/static/uploads/{safe_filename}"
    return {
        "filename": safe_filename,
        "photo_url": photo_url,
        "size_bytes": len(contents),
        "status": "SECURELY_STORED",
    }
