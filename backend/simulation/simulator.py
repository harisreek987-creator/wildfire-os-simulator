from typing import Dict, Any, Optional, List
from simulation.grid import Grid, GRID_ROWS, GRID_COLS
from simulation.fire import FireSpreadEngine, DEFAULT_SPREAD_PROBABILITY, DEFAULT_BURN_DURATION
from simulation.sensor import SensorManager
from simulation.events import EventQueue, EventType, EventSeverity, SimulationEvent
from simulation.processes import ProcessState, ProcessPriority
from simulation.resources import ResourceManager
from simulation.scheduler import PriorityScheduler
from simulation.models import (
    CellState,
    SimulationStateModel,
    WindModel,
    WindDirection,
    WindStrength,
    OSStateModel,
)


class WildfireSimulator:
    """Main Wildfire Simulation & Virtual OS Controller."""

    def __init__(
        self,
        spread_probability: float = DEFAULT_SPREAD_PROBABILITY,
        burn_duration: int = DEFAULT_BURN_DURATION,
        seed: Optional[int] = None,
        detection_delay: int = 0,
    ):
        self.grid = Grid(rows=GRID_ROWS, cols=GRID_COLS)
        self.fire_engine = FireSpreadEngine(
            spread_probability=spread_probability,
            burn_duration=burn_duration,
        )
        if seed is not None:
            self.fire_engine.set_seed(seed)

        self.wind = WindModel(direction=WindDirection.NORTH, strength=WindStrength.MEDIUM)
        self.sensor_manager = SensorManager(detection_delay=detection_delay)
        self.event_queue = EventQueue(max_history=40)
        self.resource_manager = ResourceManager()
        self.scheduler = PriorityScheduler()

        self.simulation_time: int = 0
        self.is_running: bool = False
        self.speed: float = 1.0
        self._emergency_allocated: bool = False
        self._contained_event_sent: bool = False

    def reset(self) -> SimulationStateModel:
        """Reset grid to initial state, reset sensors, wind, OS processes, events, resources, and clock."""
        self.grid.initialize_grid()
        self.sensor_manager.reset()
        self.event_queue.reset()
        self.resource_manager.reset()
        self.scheduler.reset()

        self.wind = WindModel(direction=WindDirection.NORTH, strength=WindStrength.MEDIUM)
        self.simulation_time = 0
        self.is_running = False
        self._emergency_allocated = False
        self._contained_event_sent = False

        # Add initial system event
        self.event_queue.push(
            event_type=EventType.SENSOR_SCAN,
            simulation_time=0,
            source="System",
            message="Simulator reset: Forest grid and OS subsystems initialized in MONITORING state.",
            severity=EventSeverity.INFO,
        )

        return self.get_state()

    def ignite(self, row: int, col: int) -> bool:
        """Ignite a target cell if it is HEALTHY. Returns True if successful."""
        cell = self.grid.get_cell(row, col)
        if cell is None:
            return False

        cell_state_str = str(cell.state.value if hasattr(cell.state, "value") else cell.state)
        if cell_state_str != str(CellState.HEALTHY.value):
            return False

        success = self.grid.set_cell_state(row, col, CellState.BURNING)
        if success:
            # Generate IGNITION event
            self.event_queue.push(
                event_type=EventType.IGNITION,
                simulation_time=self.simulation_time,
                source="IgnitionSource",
                message=f"Thermal ignition initiated at cell ({col}, {row}).",
                severity=EventSeverity.WARNING,
                payload={"row": row, "col": col},
            )

            # Wake up Fire Spread process (PID 101)
            self.scheduler.set_process_state(101, ProcessState.READY)

            # Check if ignition immediately triggers a sensor
            new_events = self.sensor_manager.check_detections(self.grid, self.simulation_time)
            self._handle_sensor_detection_events(new_events)

        return success

    def set_speed(self, speed: float) -> float:
        """Set simulation playback speed multiplier."""
        if speed > 0:
            self.speed = float(speed)
        return self.speed

    def set_wind(self, direction: str, strength: str) -> WindModel:
        """Set wind direction and velocity strength."""
        try:
            dir_enum = WindDirection(str(direction).upper())
            str_enum = WindStrength(str(strength).upper())
            self.wind = WindModel(direction=dir_enum, strength=str_enum)
        except ValueError:
            pass
        return self.wind

    def _handle_sensor_detection_events(self, detection_events: List[Any]) -> None:
        """Process sensor detection events and trigger high-priority Emergency Response."""
        for dev in detection_events:
            self.event_queue.push(
                event_type=EventType.SENSOR_DETECTION,
                simulation_time=self.simulation_time,
                source=dev.sensor_id,
                message=f"Sensor {dev.sensor_id} detected fire at ({dev.fire_col}, {dev.fire_row}).",
                severity=EventSeverity.ALERT,
                payload={"sensor_id": dev.sensor_id, "row": dev.fire_row, "col": dev.fire_col},
            )

            # Spawn ALERT event
            self.event_queue.push(
                event_type=EventType.ALERT,
                simulation_time=self.simulation_time,
                source="OS Kernel",
                message=f"Emergency Alert triggered by {dev.sensor_id}. Elevating Emergency Response task priority.",
                severity=EventSeverity.ALERT,
            )

            # Make Emergency Response (PID 104) READY
            self.scheduler.set_process_state(104, ProcessState.READY)

    def step(self) -> SimulationStateModel:
        """Advance simulation and OS scheduler by one tick."""
        burning_count = len(self.grid.get_cells_by_state(CellState.BURNING))

        if burning_count > 0 or self.simulation_time > 0:
            self.simulation_time += 1

            # 1. SENSOR SCAN & MONITORING
            new_detections = self.sensor_manager.check_detections(self.grid, self.simulation_time)
            if new_detections:
                self._handle_sensor_detection_events(new_detections)
            elif self.simulation_time % 5 == 0:
                self.event_queue.push(
                    event_type=EventType.SENSOR_SCAN,
                    simulation_time=self.simulation_time,
                    source="PID 102",
                    message="Routine sensor grid scan completed: Telemetry nominal.",
                    severity=EventSeverity.INFO,
                )

            # 2. EMERGENCY RESPONSE WORKLOAD (PID 104)
            er_proc = self.scheduler.processes.get(104)
            if er_proc and str(er_proc.state.value if hasattr(er_proc.state, "value") else er_proc.state) == str(ProcessState.READY.value):
                # Try to allocate resources
                ff_ok = self.resource_manager.allocate("Firefighters", 6)
                water_ok = self.resource_manager.allocate("Water Supply", 20)
                drones_ok = self.resource_manager.allocate("Surveillance Drones", 2)

                if ff_ok and water_ok and drones_ok:
                    self._emergency_allocated = True
                    self.event_queue.push(
                        event_type=EventType.EMERGENCY_RESPONSE,
                        simulation_time=self.simulation_time,
                        source="PID 104",
                        message="Emergency Response team dispatched. Priority scheduler allocated CPU cycles.",
                        severity=EventSeverity.WARNING,
                    )
                    self.event_queue.push(
                        event_type=EventType.RESOURCE_ALLOCATION,
                        simulation_time=self.simulation_time,
                        source="ResourceManager",
                        message="Allocated: 6 Firefighters, 20 kL Water, 2 Drones for active fire containment.",
                        severity=EventSeverity.INFO,
                    )
                else:
                    self.scheduler.set_process_state(
                        104, ProcessState.WAITING, waiting_reason="WAITING_FOR_RESOURCES"
                    )

            # 3. FIRE PROPAGATION (PID 101)
            suppression = 0.35 if (self._emergency_allocated and self.fire_engine.spread_probability < 1.0) else 1.0
            new_ignitions, newly_burned = self.fire_engine.step(
                self.grid, self.wind, suppression_factor=suppression
            )
            if new_ignitions > 0:
                self.event_queue.push(
                    event_type=EventType.FIRE_SPREAD,
                    simulation_time=self.simulation_time,
                    source="PID 101",
                    message=f"Fire spread to {new_ignitions} new cells with wind ({self.wind.direction}, {self.wind.strength}).",
                    severity=EventSeverity.WARNING,
                )

            # 4. EVENT HANDLER (PID 103)
            # Process pending queue events
            while not self.event_queue.is_empty():
                _ = self.event_queue.pop()

            # 5. CONTAINMENT CHECK & RESOURCE RELEASE
            current_burning = len(self.grid.get_cells_by_state(CellState.BURNING))
            if current_burning == 0 and self.simulation_time > 0 and not self._contained_event_sent:
                self._contained_event_sent = True
                self.is_running = False
                self.event_queue.push(
                    event_type=EventType.FIRE_CONTAINED,
                    simulation_time=self.simulation_time,
                    source="OS Kernel",
                    message="All active fires extinguished. Releasing allocated emergency resources.",
                    severity=EventSeverity.SUCCESS,
                )
                self.resource_manager.release_all()
                self.scheduler.set_process_state(104, ProcessState.COMPLETED)
                self.scheduler.set_process_state(101, ProcessState.WAITING)

            # 6. SCHEDULER CYCLE
            # Determine preferred PID based on active emergency
            preferred_pid = 104 if (er_proc and str(er_proc.state.value if hasattr(er_proc.state, "value") else er_proc.state) == str(ProcessState.READY.value)) else 101
            self.scheduler.schedule_tick(self.simulation_time, preferred_pid=preferred_pid)

        return self.get_state()

    def start(self) -> None:
        """Set simulation state to active."""
        self.is_running = True

    def pause(self) -> None:
        """Pause simulation execution."""
        self.is_running = False

    def get_state(self) -> SimulationStateModel:
        """Return structured, JSON-serializable snapshot of current simulation and OS state."""
        burning = len(self.grid.get_cells_by_state(CellState.BURNING))
        burned = len(self.grid.get_cells_by_state(CellState.BURNED))
        healthy = len(self.grid.get_cells_by_state(CellState.HEALTHY))
        water = len(self.grid.get_cells_by_state(CellState.WATER))

        proc_list = self.scheduler.get_process_list()
        recent_evts = self.event_queue.get_recent_events()
        res_list = self.resource_manager.get_all_resources()

        current_running_name = None
        if self.scheduler.current_pid and self.scheduler.current_pid in self.scheduler.processes:
            current_running_name = self.scheduler.processes[self.scheduler.current_pid].name

        os_state = OSStateModel(
            processes=proc_list,
            running_process_pid=self.scheduler.current_pid,
            running_process_name=current_running_name,
            recent_events=recent_evts,
            resources=res_list,
            scheduler_policy="PRIORITY",
        )

        return SimulationStateModel(
            grid=self.grid.get_state_matrix(),
            simulation_time=self.simulation_time,
            is_running=self.is_running,
            speed=self.speed,
            wind=self.wind,
            sensors=self.sensor_manager.get_sensor_models(),
            first_detection_time=self.sensor_manager.first_detection_time,
            burning_cells=burning,
            burned_cells=burned,
            healthy_cells=healthy,
            water_cells=water,
            total_cells=self.grid.rows * self.grid.cols,
            os=os_state,
            processes=proc_list,
            events=recent_evts,
            resources=res_list,
        )

    def get_state_dict(self) -> Dict[str, Any]:
        """Convenience method returning state as raw Python dictionary."""
        return self.get_state().model_dump()
