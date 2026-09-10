import json
import logging
from typing import List, Set, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("sih26002.websocket")


class ConnectionManager:
    """
    Manages active WebSocket connections for live broadcasting of vehicle ticks,
    road accessibility changes, hazard alerts, and timeline updates.
    """

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        if not self.active_connections:
            return

        payload = json.dumps(message)
        dead_connections = set()

        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as exc:
                logger.warning(f"Error sending message to websocket client: {exc}")
                dead_connections.add(connection)

        for dead in dead_connections:
            self.active_connections.discard(dead)


manager = ConnectionManager()
