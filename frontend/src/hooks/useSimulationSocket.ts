import { useEffect, useRef, useState } from 'react';
import type { SimulationStatus, LiveEvent } from '../types';

interface UseSimulationSocketProps {
  onVehicleTick?: (status: SimulationStatus) => void;
  onLiveEvent?: (event: LiveEvent) => void;
  onRoadUpdate?: (data: any) => void;
  onHazardDetected?: (data: any) => void;
  onFullStateUpdate?: (status: SimulationStatus) => void;
}

export function useSimulationSocket({
  onVehicleTick,
  onLiveEvent,
  onRoadUpdate,
  onHazardDetected,
  onFullStateUpdate,
}: UseSimulationSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: any;

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws/live');
        socketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'VEHICLE_TICK' && onVehicleTick) {
              onVehicleTick(data.status);
            } else if (data.type === 'LIVE_EVENT' && onLiveEvent) {
              onLiveEvent(data.event);
            } else if (data.type === 'ROAD_STATUS_UPDATE' && onRoadUpdate) {
              onRoadUpdate(data);
            } else if (data.type === 'HAZARD_DETECTED' && onHazardDetected) {
              onHazardDetected(data);
            } else if (data.type === 'FULL_STATE_UPDATE' && onFullStateUpdate) {
              onFullStateUpdate(data.status);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws.close();
        };
      } catch (err) {
        console.error('WebSocket connection failed:', err);
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [onVehicleTick, onLiveEvent, onRoadUpdate, onHazardDetected, onFullStateUpdate]);

  return { isConnected };
}
