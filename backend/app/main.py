import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.db.seed_data import seed_database
from app.api.v1.router import api_router
from app.websockets.manager import manager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sih26002")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SIH26002 Database & Seeding Phase 2 Architecture...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    if settings.GOOGLE_MAPS_API_KEY and settings.GOOGLE_MAPS_API_KEY.strip():
        logger.info("Routing Provider: Google Routes API configured (server-side authenticated).")
    else:
        logger.info("Routing Provider: Google Routes unconfigured — primary fallback to OSRM & local topological graph active.")
    logger.info("SIH26002 Backend initialized successfully with Phase 2 ML & Risk pipelines.")
    yield
    logger.info("SIH26002 Backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER) - Ministry of Development of North Eastern Region (MDoNER)",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


# WebSocket live channel
@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            logger.debug(f"Received WS message: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as exc:
        logger.warning(f"WebSocket error: {exc}")
        manager.disconnect(websocket)
