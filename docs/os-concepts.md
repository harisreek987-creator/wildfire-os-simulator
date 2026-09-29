# OS Concepts Specification — Wildfire OS Simulator

## 1. Virtual Operating System Model

The Wildfire OS Simulator models an emergency response command center as an educational Virtual Operating System. Physical entities and simulation loops are mapped directly into standard OS primitives: processes, process control blocks (PCBs), priority scheduling, an inter-process communication (IPC) event queue, and shared resource management.

---

## 2. Process Control Block (PCB) & Virtual Processes

Every task in the simulator runs as a logical Virtual Process identified by a Process Control Block (`VirtualProcess`):

| PID | Process Name | Priority | Rank | Responsibilities |
|---|---|---|---|---|
| **104** | **Emergency Response** | `HIGHEST` | 1 | Preempts regular execution on detection alerts, requests containment resources, coordinates suppression. |
| **101** | **Fire Spread Engine** | `HIGH` | 2 | Executes cellular automata propagation calculations and wind directional probability vectors. |
| **102** | **Sensor Monitor** | `MEDIUM` | 3 | Periodically scans thermal/infrared sensor nodes and checks Euclidean fire proximity. |
| **103** | **Event Handler** | `MEDIUM` | 3 | Manages the FIFO IPC message buffer, dispatches system alerts, and formats telemetry. |
| **105** | **Statistics Collector** | `LOW` | 4 | Background analytical task aggregating burn rates, containment percentages, and resource metrics. |

### PCB Data Fields
- `pid`: Unique integer process identifier.
- `name`: Human-readable task designation.
- `priority`: Priority classification (`HIGHEST`, `HIGH`, `MEDIUM`, `LOW`).
- `priority_level`: Numeric scheduling rank (1 = highest).
- `state`: Lifecycle state.
- `created_at`: Simulation step time of spawn.
- `last_run_at`: Simulation step when CPU was last allocated.
- `execution_count`: Total CPU ticks consumed by the process.
- `waiting_reason`: Reason string if the process is in a `WAITING` state (e.g., `WAITING_FOR_RESOURCES`).
- `cpu_usage`: Simulated percentage load.
- `description`: Educational responsibility summary.

---

## 3. Process Lifecycle States

Processes transition through four canonical OS states:

1. **`READY`**: Process is in the ready queue eligible for CPU scheduling.
2. **`RUNNING`**: Process is actively assigned the CPU tick by the `PriorityScheduler`.
3. **`WAITING`**: Process is blocked waiting for an event or insufficient shared resources (e.g., waiting for firefighters or sensor scan).
4. **`COMPLETED`**: Process has completed its emergency response lifecycle (e.g., when all active fires are contained).

---

## 4. Priority Scheduling Algorithm

The simulation implements a **Preemptive Priority-Based Scheduler** (`PriorityScheduler`):

- **Selection Rule**: At each simulation tick, the scheduler evaluates all `READY` processes and selects the process with the highest priority rank (`priority_level` = 1 is highest).
- **Preemption**: When a `SENSOR_DETECTION` occurs, an `ALERT` event wakes up the Emergency Response process (`PID 104`, rank 1), immediately preempting lower-priority tasks.
- **Tie-Breaking**: When multiple processes share identical priority levels (e.g., Sensor Monitor PID 102 and Event Handler PID 103 at rank 3), deterministic tie-breaking selects the lower PID first.

---

## 5. IPC Event Queue

Inter-process communication and audit logging are implemented through a FIFO **Event Queue** (`EventQueue`) with bounded history buffer:

### 8 Required Event Types
1. **`IGNITION`**: Triggered upon manual or scenario-based fire ignition at grid coordinate `(x, y)`.
2. **`FIRE_SPREAD`**: Emitted by Fire Spread Engine (PID 101) when fire propagates to adjacent cells.
3. **`SENSOR_SCAN`**: Emitted periodically during routine sensor grid sweeps.
4. **`SENSOR_DETECTION`**: Generated when fire enters a sensor's Euclidean detection radius.
5. **`ALERT`**: Kernel-level interrupt event that elevates the Emergency Response process priority.
6. **`EMERGENCY_RESPONSE`**: Dispatched when Emergency Response (PID 104) is scheduled and active.
7. **`RESOURCE_ALLOCATION`**: Logged when shared emergency resources are successfully acquired.
8. **`FIRE_CONTAINED`**: Emitted when all active burning cells are extinguished.

---

## 6. Shared Resource Management & Mutex Allocation

Simulated emergency response resources are managed centrally by the `ResourceManager`:

| Resource | Total Capacity | Default Allocation per Response | Unit |
|---|---|---|---|
| **Firefighters** | 20 | 6 | Units |
| **Water Supply** | 100 | 20 | kL |
| **Surveillance Drones** | 4 | 2 | Units |

### Allocation Protocol
- **Atomic Acquisition**: When Emergency Response is scheduled, it requests resource locks for Firefighters, Water, and Drones.
- **Resource Starvation / Waiting**: If insufficient resources exist, allocation fails safely, and the process enters `WAITING` with reason `WAITING_FOR_RESOURCES`.
- **Resource Release**: When containment is achieved (`FIRE_CONTAINED`), all allocated resources are released atomically back into the pool.
- **Reset**: A system reset returns all resource availability back to initial totals (20 Firefighters, 100 kL Water, 4 Drones).
