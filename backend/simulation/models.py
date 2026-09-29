from enum import Enum
from typing import List, Optional, Tuple, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from simulation.processes import VirtualProcess
from simulation.events import SimulationEvent
from simulation.resources import ResourceItem


class CellState(str, Enum):
    HEALTHY = "healthy"
    BURNING = "burning"
    BURNED = "burned"
    WATER = "water"


class WindDirection(str, Enum):
    NORTH = "NORTH"
    SOUTH = "SOUTH"
    EAST = "EAST"
    WEST = "WEST"


class WindStrength(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class SensorStatus(str, Enum):
    MONITORING = "MONITORING"
    DETECTED = "DETECTED"
    INACTIVE = "INACTIVE"


class CellModel(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    row: int = Field(..., ge=0, lt=20, description="Grid row index")
    col: int = Field(..., ge=0, lt=20, description="Grid column index")
    state: CellState = Field(default=CellState.HEALTHY, description="Current cell state")
    burn_counter: int = Field(default=0, ge=0, description="Steps cell has been burning")


class WindModel(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    direction: WindDirection = Field(default=WindDirection.NORTH, description="Wind blowing direction")
    strength: WindStrength = Field(default=WindStrength.MEDIUM, description="Wind velocity intensity")


class SensorModel(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str = Field(..., description="Unique sensor identifier (e.g. S-01)")
    name: str = Field(..., description="Descriptive sector name")
    row: int = Field(..., ge=0, lt=20, description="Grid row position")
    col: int = Field(..., ge=0, lt=20, description="Grid column position")
    detection_radius: float = Field(..., gt=0, description="Euclidean detection range in cells")
    status: SensorStatus = Field(default=SensorStatus.MONITORING, description="Current sensor status")
    detected_at: Optional[int] = Field(default=None, description="Simulation step time when fire was detected")
    detected_fire_pos: Optional[Tuple[int, int]] = Field(default=None, description="(row, col) of first detected fire")


class DetectionEventModel(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    sensor_id: str
    simulation_time: int
    fire_row: int
    fire_col: int


class OSStateModel(BaseModel):
    """Virtual Operating System snapshot state."""
    model_config = ConfigDict(use_enum_values=True)

    processes: List[VirtualProcess] = Field(default_factory=list, description="List of OS virtual processes (PCB)")
    running_process_pid: Optional[int] = Field(default=None, description="PID of currently executing process")
    running_process_name: Optional[str] = Field(default=None, description="Name of currently executing process")
    recent_events: List[SimulationEvent] = Field(default_factory=list, description="Bounded history of IPC events")
    resources: List[ResourceItem] = Field(default_factory=list, description="System shared emergency resources")
    scheduler_policy: str = Field(default="PRIORITY", description="Active CPU scheduling policy")


class SimulationStateModel(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    grid: List[List[str]] = Field(..., description="20x20 cell state matrix")
    simulation_time: int = Field(default=0, ge=0, description="Current simulation step counter")
    is_running: bool = Field(default=False, description="Whether simulation is active")
    speed: float = Field(default=1.0, description="Playback speed multiplier")
    wind: WindModel = Field(default_factory=WindModel, description="Current wind vector configuration")
    sensors: List[SensorModel] = Field(default_factory=list, description="List of deployed fire sensors")
    first_detection_time: Optional[int] = Field(default=None, description="Step time when first sensor detected fire")
    burning_cells: int = Field(default=0, ge=0, description="Number of currently burning cells")
    burned_cells: int = Field(default=0, ge=0, description="Number of burned cells")
    healthy_cells: int = Field(default=0, ge=0, description="Number of healthy cells")
    water_cells: int = Field(default=0, ge=0, description="Number of water cells")
    total_cells: int = Field(default=400, description="Total grid cell count")

    # Integrated Virtual OS State
    os: Optional[OSStateModel] = Field(default=None, description="Virtual OS subsystems snapshot")
    processes: List[VirtualProcess] = Field(default_factory=list, description="Direct process list reference")
    events: List[SimulationEvent] = Field(default_factory=list, description="Direct recent event history reference")
    resources: List[ResourceItem] = Field(default_factory=list, description="Direct resource pool reference")


class IgniteRequest(BaseModel):
    row: int = Field(..., description="Grid row index")
    col: int = Field(..., description="Grid column index")


class SetWindRequest(BaseModel):
    direction: WindDirection = Field(..., description="Wind direction")
    strength: WindStrength = Field(..., description="Wind strength")


class ComparisonRequestModel(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    ignition_row: int = Field(default=10, ge=0, lt=20, description="Ignition row coordinate")
    ignition_col: int = Field(default=10, ge=0, lt=20, description="Ignition col coordinate")
    wind_direction: WindDirection = Field(default=WindDirection.NORTH, description="Wind direction for both runs")
    wind_strength: WindStrength = Field(default=WindStrength.MEDIUM, description="Wind velocity for both runs")
    spread_probability: float = Field(default=0.35, gt=0, le=1.0, description="Base propagation probability")
    burn_duration: int = Field(default=3, ge=1, description="Burn duration before cell turns burned")
    late_detection_delay: int = Field(default=6, ge=1, le=20, description="Detection delay in steps for late run")
    seed: Optional[int] = Field(default=42, description="Random seed for identical comparison runs")
    max_steps: int = Field(default=35, ge=5, le=100, description="Max simulation steps to evaluate")


class DetectionRunResult(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    mode: str = Field(..., description="'EARLY' or 'LATE'")
    detection_time: Optional[int] = Field(default=None, description="Simulation step when first detected")
    detection_delay: int = Field(..., description="Delay applied to sensor telemetry")
    containment_time: Optional[int] = Field(default=None, description="Step when all active fires were extinguished")
    contained: bool = Field(default=False, description="Whether fire was fully extinguished")
    total_burned_cells: int = Field(..., ge=0, description="Total cells converted to burned state")
    peak_burning_cells: int = Field(..., ge=0, description="Maximum concurrent burning cells observed")
    fire_spread_percent: str = Field(..., description="Burned percentage of 20x20 forest grid")
    firefighters_allocated: int = Field(default=0, ge=0, description="Firefighters mobilized")
    water_allocated: int = Field(default=0, ge=0, description="Water volume deployed in kL")
    drones_allocated: int = Field(default=0, ge=0, description="Surveillance drones active")
    total_steps: int = Field(..., ge=0, description="Total steps executed in run")


class ComparisonTimeSeriesPoint(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    step: int = Field(..., ge=0)
    time: str = Field(..., description="Formatted timestamp MM:SS")
    early_burned: int = Field(..., ge=0)
    early_burning: int = Field(..., ge=0)
    late_burned: int = Field(..., ge=0)
    late_burning: int = Field(..., ge=0)


class ComparisonSummaryModel(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    burned_cells_difference: int = Field(..., description="late_burned - early_burned")
    containment_time_difference: Optional[int] = Field(default=None, description="late_time - early_time")
    peak_burning_difference: int = Field(..., description="late_peak - early_peak")
    detection_time_difference: Optional[int] = Field(default=None, description="late_detection - early_detection")
    saved_cells_percent: str = Field(..., description="Percentage of damage prevented by early detection")


class ComparisonResponseModel(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    config: ComparisonRequestModel = Field(..., description="Experiment parameters applied")
    early: DetectionRunResult = Field(..., description="Early detection experiment results")
    late: DetectionRunResult = Field(..., description="Late detection experiment results")
    summary: ComparisonSummaryModel = Field(..., description="Comparative delta summary")
    time_series: List[ComparisonTimeSeriesPoint] = Field(default_factory=list, description="Step time series data")

