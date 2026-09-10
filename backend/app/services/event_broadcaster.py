from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid
from app.websockets.manager import manager
from app.schemas.events import LiveEvent


class EventBroadcaster:
    """
    Maintains the live operational event timeline and broadcasts real-time updates.
    """

    def __init__(self):
        self.timeline_events: List[Dict[str, Any]] = []

    def get_timeline(self) -> List[Dict[str, Any]]:
        return list(reversed(self.timeline_events[-50:]))  # Return most recent 50

    async def log_and_broadcast_event(
        self,
        event_type: str,
        severity: str,
        title: str,
        description: str,
        metadata: Optional[Any] = None,
    ) -> Dict[str, Any]:
        now = datetime.now()
        event_obj = {
            "id": str(uuid.uuid4()),
            "timestamp": now.isoformat(),
            "formatted_time": now.strftime("%H:%M:%S"),
            "event_type": event_type,
            "severity": severity,  # INFO, WARNING, DANGER, SUCCESS
            "title": title,
            "description": description,
            "metadata": metadata or {},
        }
        self.timeline_events.append(event_obj)

        # Broadcast event to all WebSocket listeners
        await manager.broadcast({
            "type": "LIVE_EVENT",
            "event": event_obj,
        })

        return event_obj

    def clear_timeline(self):
        self.timeline_events = []


event_broadcaster = EventBroadcaster()
