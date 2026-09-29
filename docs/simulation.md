# Simulation Engine Specification — Wildfire OS Simulator

## Grid Model

- Default size: **20 × 20 cells** (400 cells total)
- Cell States:
  - `healthy`: Intact forest cell
  - `burning`: Active fire cell
  - `burned`: Depleted/charred cell
  - `water`: Firebreak / non-burnable cell

---

## Fire Propagation & Wind System

Fire spreads probabilistically to adjacent 4 cardinal neighboring cells (NORTH, SOUTH, EAST, WEST) during each tick.

### Base Parameters
- `DEFAULT_SPREAD_PROBABILITY` = `0.35`
- `DEFAULT_BURN_DURATION` = `3` steps

### Wind Vector Influence
Wind direction and strength modify the base spread probability:

#### Wind Direction Mapping
- `NORTH`: Fire spreads preferentially toward decreasing row values (`row - 1`).
- `SOUTH`: Fire spreads preferentially toward increasing row values (`row + 1`).
- `EAST`: Fire spreads preferentially toward increasing column values (`col + 1`).
- `WEST`: Fire spreads toward decreasing column values (`col - 1`).

#### Orientation Multipliers
- **DOWNWIND**: Neighbor in the direction wind is blowing towards.
- **UPWIND**: Neighbor opposite to wind direction.
- **CROSSWIND**: Perpendicular neighbor cells.

| Wind Strength | Downwind Multiplier | Crosswind Multiplier | Upwind Multiplier |
|---|---|---|---|
| **LOW** | 1.2× | 1.0× | 0.8× |
| **MEDIUM** | 1.5× | 1.0× | 0.5× |
| **HIGH** | 2.0× | 1.0× | 0.25× |

#### Probability Calculation
$$\text{Probability}_{\text{effective}} = \min\left(1.0, \max\left(0.0, \text{base\_prob} \times \text{multiplier}\right)\right)$$

---

## Sensor Network & Spatial Detection Model

The simulation deploys optical and infrared sensor nodes across the forest grid to monitor thermal anomalies.

### Sensor Model
Each sensor node consists of:
- `id`: Unique identifier (`S-01`, `S-02`, etc.)
- `name`: Sector assignment name
- `row`, `col`: Grid spatial coordinates
- `detection_radius`: Euclidean radius in cell units
- `status`: Node state (`MONITORING`, `DETECTED`, `INACTIVE`)
- `detected_at`: Simulation step clock when fire was first detected

### Default Deployed Sensor Grid
1. `S-01` (NW Sector Alpha): Position `(5, 5)`, Radius: `3.0` cells
2. `S-02` (Central Command Post): Position `(10, 10)`, Radius: `4.0` cells
3. `S-03` (SE Ridge Drone Node): Position `(15, 15)`, Radius: `3.0` cells
4. `S-04` (SW Valley Optical): Position `(15, 5)`, Radius: `3.0` cells

### Euclidean Distance Formula
A sensor detects fire during a tick if any `BURNING` cell satisfies:
$$\text{Distance} = \sqrt{(\text{sensor\_row} - \text{fire\_row})^2 + (\text{sensor\_col} - \text{fire\_col})^2} \le \text{detection\_radius}$$

When triggered:
- Sensor transitions from `MONITORING` $\rightarrow$ `DETECTED`.
- `detected_at` timestamp is recorded.
- `first_detection_time` of the simulation run is captured.
- On simulation `RESET`, all sensors return to `MONITORING` state.

---

## Early vs. Late Detection Experiment Methodology

The simulator provides a controlled, deterministic benchmarking engine to evaluate how early detection vs. delayed detection impacts wildfire containment and system resource mobilization.

### 1. Controlled Experiment Design
Both simulation runs are initialized with strictly identical baseline parameters:
- **Grid Dimensions**: 20 × 20 cells (400 cells total)
- **Ignition Point**: Cell `(10, 10)` (Central sector)
- **Wind Vector**: `NORTH`, `MEDIUM` intensity
- **Spread Probability**: `0.35`
- **Burn Duration**: `3` steps
- **Random Seed**: `42` (ensures identical cellular automata pseudo-random numbers)
- **Sensor Placement**: Standard 4-node monitoring array

### 2. Detection Modes
- **Early Detection (`delay = 0`)**:
  - Sensor nodes immediately register thermal presence when burning cells enter their detection radius.
  - The OS Kernel elevates Emergency Response (`PID 104`) to `READY`, which preemptively allocates Firefighters, Water Supply, and Drones. Active suppression reduces spread probability to 0.35×, damping fire progression early.
- **Late Detection (`delay > 0`, e.g. 6 steps)**:
  - Sensor telemetry is withheld for a deterministic delay of $N$ steps after fire enters the detection radius.
  - Fire propagates unconstrained during the delay period. By the time detection is triggered, the fire perimeter is larger, requiring more time and resulting in significantly higher burn counts.

### 3. Measured Metrics
| Metric | Unit | Description |
|---|---|---|
| **Detection Time** | Simulation Step (`T+s`) | Step tick when sensor grid first registers fire. |
| **Detection Delay** | Steps (`s`) | Artificially configured telemetry latency ($0$ for Early, $N$ for Late). |
| **Peak Fire Size** | Cells | Maximum concurrent burning cells at any single simulation step. |
| **Total Burned Cells** | Cells | Cumulative forest cells converted to charred `BURNED` state. |
| **Fire Spread Area** | Percentage (`%`) | Ratio of burned cells to total 400 grid cells. |
| **Containment Time** | Simulation Step (`T+s`) | Step tick when all active burning cells reach 0. |
| **Resources Mobilized** | Physical Units | Firefighters, Water volume (kL), and Surveillance Drones deployed. |
| **Saved Forest Cells** | Cells / % | Quantitative difference between late and early burn totals. |

