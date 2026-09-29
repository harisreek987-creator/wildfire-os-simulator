import math
from typing import List, Optional, Tuple, Any
from simulation.grid import Grid
from simulation.models import (
    CellState,
    SensorModel,
    SensorStatus,
    DetectionEventModel,
)


class SensorManager:
    """Manages sensor grid deployment, spatial scanning, and fire detection events."""

    def __init__(self, detection_delay: int = 0):
        self.sensors: List[SensorModel] = []
        self.events: List[DetectionEventModel] = []
        self.first_detection_time: Optional[int] = None
        self.detection_delay: int = max(0, int(detection_delay))
        self._first_seen_step: Optional[int] = None
        self.initialize_default_sensors()

    def initialize_default_sensors(self) -> None:
        """Instantiate default 4 sensor nodes across the 20x20 forest grid."""
        self.sensors = [
            SensorModel(
                id="S-01",
                name="NW Sector Alpha",
                row=5,
                col=5,
                detection_radius=3.0,
                status=SensorStatus.MONITORING,
            ),
            SensorModel(
                id="S-02",
                name="Central Command Post",
                row=10,
                col=10,
                detection_radius=4.0,
                status=SensorStatus.MONITORING,
            ),
            SensorModel(
                id="S-03",
                name="SE Ridge Drone Node",
                row=15,
                col=15,
                detection_radius=3.0,
                status=SensorStatus.MONITORING,
            ),
            SensorModel(
                id="S-04",
                name="SW Valley Optical",
                row=15,
                col=5,
                detection_radius=3.0,
                status=SensorStatus.MONITORING,
            ),
        ]
        self.events = []
        self.first_detection_time = None
        self._first_seen_step = None

    def reset(self) -> None:
        """Reset all sensors to initial MONITORING state and clear detection telemetry."""
        for sensor in self.sensors:
            sensor.status = SensorStatus.MONITORING
            sensor.detected_at = None
            sensor.detected_fire_pos = None
        self.events = []
        self.first_detection_time = None
        self._first_seen_step = None

    def check_detections(self, grid: Grid, simulation_time: int) -> List[DetectionEventModel]:
        """Scans active burning cells against sensor detection radii using Euclidean distance.

        Supports configurable detection delay for Early vs Late detection experiments.
        Returns a list of newly generated detection events during this step.
        """
        burning_cells = grid.get_cells_by_state(CellState.BURNING)
        if not burning_cells:
            return []

        # Check if any monitoring sensor is in range of burning cells
        monitoring_sensors = [
            s for s in self.sensors
            if str(s.status.value if hasattr(s.status, "value") else s.status) == str(SensorStatus.MONITORING.value)
        ]
        if not monitoring_sensors:
            return []

        sensors_in_range: List[Tuple[SensorModel, Any]] = []
        for sensor in monitoring_sensors:
            for fire_cell in burning_cells:
                dist = math.sqrt(
                    (sensor.row - fire_cell.row) ** 2 + (sensor.col - fire_cell.col) ** 2
                )
                if dist <= sensor.detection_radius:
                    sensors_in_range.append((sensor, fire_cell))
                    break

        if not sensors_in_range:
            return []

        # Track first step when fire entered sensor perimeter
        if self._first_seen_step is None:
            self._first_seen_step = simulation_time

        # Hold detection if delay has not elapsed
        if self.detection_delay > 0 and simulation_time < (self._first_seen_step + self.detection_delay):
            return []

        new_events: List[DetectionEventModel] = []
        for sensor, fire_cell in sensors_in_range:
            sensor.status = SensorStatus.DETECTED
            sensor.detected_at = simulation_time
            sensor.detected_fire_pos = (fire_cell.row, fire_cell.col)

            event = DetectionEventModel(
                sensor_id=sensor.id,
                simulation_time=simulation_time,
                fire_row=fire_cell.row,
                fire_col=fire_cell.col,
            )
            new_events.append(event)
            self.events.append(event)

            if self.first_detection_time is None:
                self.first_detection_time = simulation_time

        return new_events

    def get_sensor_models(self) -> List[SensorModel]:
        """Return list of current sensor models."""
        return self.sensors
