import asyncio
import json
import logging
from typing import Set
from fastapi import WebSocket, WebSocketDisconnect
from simulation.simulator import WildfireSimulator

logger = logging.getLogger("simulation.ws")


class ConnectionManager:
    """Manages active WebSocket clients and non-blocking real-time simulation tick loop."""

    def __init__(self, simulator: WildfireSimulator):
        self.simulator = simulator
        self.active_connections: Set[WebSocket] = set()
        self._loop_task: asyncio.Optional[asyncio.Task] = None
        self.base_interval_sec: float = 1.0

    async def connect(self, websocket: WebSocket) -> None:
        """Accept connection and send current initial state."""
        await websocket.accept()
        self.active_connections.add(websocket)
        # Immediately send current state snapshot
        await self.send_state(websocket)

        # Start loop task if not running
        if self._loop_task is None or self._loop_task.done():
            self._loop_task = asyncio.create_task(self._simulation_loop())

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove disconnected websocket client."""
        self.active_connections.discard(websocket)

    async def broadcast_state(self) -> None:
        """Broadcast state to all connected clients."""
        if not self.active_connections:
            return

        state_dict = self.simulator.get_state_dict()
        disconnected: Set[WebSocket] = set()

        for connection in list(self.active_connections):
            try:
                await connection.send_json(state_dict)
            except Exception:
                disconnected.add(connection)

        for conn in disconnected:
            self.disconnect(conn)

    async def send_state(self, websocket: WebSocket) -> None:
        """Send state to a specific websocket client."""
        try:
            state_dict = self.simulator.get_state_dict()
            await websocket.send_json(state_dict)
        except Exception:
            self.disconnect(websocket)

    async def handle_command(self, raw_data: str) -> None:
        """Process command JSON string from frontend client safely."""
        try:
            data = json.loads(raw_data)
        except (json.JSONDecodeError, TypeError):
            logger.warning("Received malformed non-JSON command.")
            return

        cmd_type = str(data.get("type", "")).lower()

        if cmd_type in ["start", "resume"]:
            self.simulator.start()
        elif cmd_type == "pause":
            self.simulator.pause()
        elif cmd_type == "reset":
            self.simulator.reset()
        elif cmd_type == "step":
            self.simulator.step()
        elif cmd_type == "ignite":
            row = data.get("row")
            col = data.get("col")
            if isinstance(row, int) and isinstance(col, int):
                self.simulator.ignite(row, col)
        elif cmd_type == "set_speed":
            speed = data.get("speed")
            if isinstance(speed, (int, float)) and speed > 0:
                self.simulator.set_speed(float(speed))
        elif cmd_type == "set_wind":
            direction = data.get("direction")
            strength = data.get("strength")
            if direction and strength:
                self.simulator.set_wind(str(direction), str(strength))

        # Broadcast state immediately after processing command
        await self.broadcast_state()

    async def _simulation_loop(self) -> None:
        """Background asyncio loop for periodic simulation ticks."""
        try:
            while True:
                # Calculate sleep delay based on speed multiplier
                speed = max(0.1, self.simulator.speed)
                sleep_duration = max(0.05, self.base_interval_sec / speed)

                await asyncio.sleep(sleep_duration)

                if self.simulator.is_running and self.active_connections:
                    self.simulator.step()
                    await self.broadcast_state()
        except asyncio.CancelledError:
            pass
