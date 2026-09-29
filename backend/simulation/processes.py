from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ProcessState(str, Enum):
    READY = "READY"
    RUNNING = "RUNNING"
    WAITING = "WAITING"
    COMPLETED = "COMPLETED"


class ProcessPriority(str, Enum):
    HIGHEST = "HIGHEST"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


# Numerical mapping for scheduler comparison (lower number = higher priority)
PRIORITY_LEVELS = {
    ProcessPriority.HIGHEST: 1,
    ProcessPriority.HIGH: 2,
    ProcessPriority.MEDIUM: 3,
    ProcessPriority.LOW: 4,
}


class VirtualProcess(BaseModel):
    """Process Control Block (PCB) for virtual OS simulation processes."""
    model_config = ConfigDict(use_enum_values=True)

    pid: int = Field(..., description="Unique Process Identifier")
    name: str = Field(..., description="Descriptive process task name")
    priority: ProcessPriority = Field(..., description="Process priority category")
    priority_level: int = Field(..., description="Numeric priority rank (1 is highest)")
    state: ProcessState = Field(default=ProcessState.READY, description="Current lifecycle state")
    created_at: int = Field(default=0, description="Simulation step when process was spawned")
    last_run_at: Optional[int] = Field(default=None, description="Simulation step when process last executed")
    execution_count: int = Field(default=0, description="Total CPU ticks/cycles consumed")
    waiting_reason: Optional[str] = Field(default=None, description="Reason if process is in WAITING state")
    cpu_usage: int = Field(default=0, description="Simulated percentage CPU load")
    description: str = Field(default="", description="Educational description of process responsibility")
