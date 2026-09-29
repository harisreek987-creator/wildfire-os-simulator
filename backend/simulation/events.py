from enum import Enum
from typing import List, Optional, Dict, Any
from collections import deque
from pydantic import BaseModel, Field, ConfigDict


class EventType(str, Enum):
    IGNITION = "IGNITION"
    FIRE_SPREAD = "FIRE_SPREAD"
    SENSOR_SCAN = "SENSOR_SCAN"
    SENSOR_DETECTION = "SENSOR_DETECTION"
    ALERT = "ALERT"
    EMERGENCY_RESPONSE = "EMERGENCY_RESPONSE"
    RESOURCE_ALLOCATION = "RESOURCE_ALLOCATION"
    FIRE_CONTAINED = "FIRE_CONTAINED"


class EventSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ALERT = "alert"
    SUCCESS = "success"


class SimulationEvent(BaseModel):
    """Virtual OS IPC Event representation."""
    model_config = ConfigDict(use_enum_values=True)

    event_id: str = Field(..., description="Unique event ID")
    event_type: EventType = Field(..., description="Categorical event type")
    simulation_time: int = Field(..., description="Simulation timestamp")
    source: str = Field(..., description="Originating process or sensor (e.g. S-01, PID 101)")
    message: str = Field(..., description="Human-readable event log message")
    severity: EventSeverity = Field(default=EventSeverity.INFO, description="Visual severity level")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Metadata payload")


class EventQueue:
    """FIFO Inter-Process Communication (IPC) Event Queue."""

    def __init__(self, max_history: int = 50):
        self._queue: deque[SimulationEvent] = deque()
        self._history: deque[SimulationEvent] = deque(maxlen=max_history)
        self._counter: int = 0

    def push(
        self,
        event_type: EventType,
        simulation_time: int,
        source: str,
        message: str,
        severity: EventSeverity = EventSeverity.INFO,
        payload: Optional[Dict[str, Any]] = None,
    ) -> SimulationEvent:
        """Enqueue a new simulation event."""
        self._counter += 1
        event = SimulationEvent(
            event_id=f"evt-{self._counter:04d}",
            event_type=event_type,
            simulation_time=simulation_time,
            source=source,
            message=message,
            severity=severity,
            payload=payload or {},
        )
        self._queue.append(event)
        self._history.appendleft(event)
        return event

    def pop(self) -> Optional[SimulationEvent]:
        """Dequeue the next event in FIFO order."""
        if self._queue:
            return self._queue.popleft()
        return None

    def peek(self) -> Optional[SimulationEvent]:
        """Inspect the next event in queue without removing it."""
        if self._queue:
            return self._queue[0]
        return None

    def is_empty(self) -> bool:
        return len(self._queue) == 0

    def get_pending_count(self) -> int:
        return len(self._queue)

    def get_recent_events(self) -> List[SimulationEvent]:
        """Return the bounded recent history of events for UI log display."""
        return list(self._history)

    def reset(self) -> None:
        """Clear queue and history on simulation reset."""
        self._queue.clear()
        self._history.clear()
        self._counter = 0
