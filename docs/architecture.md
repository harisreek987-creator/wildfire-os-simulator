# Architecture Specification — Wildfire OS Simulator

## Overview

The Wildfire OS Simulator uses a hybrid architecture separating the real-time simulation engine (Python / FastAPI) from the visual control dashboard (React / TypeScript / Vite).

## System Flow

```
React Frontend (UI Dashboard / Telemetry)
        ↓ ↑ (WebSocket Stream /ws/simulation)
FastAPI Server (WebSocket ConnectionManager & REST Endpoints)
        ↓ ↑
Simulation Engine (Grid State, 2-Stage Fire Propagation, Clock, Speed Multiplier)
```

## Responsibilities

### Frontend (React + Vite + Tailwind CSS)
- Command center UI rendering
- Interactive 20x20 forest grid visualizer connected to real Python simulation state
- Simulation control panel (`START`, `PAUSE`, `RESUME`, `RESET`, `STEP`, Speed 1x–10x)
- Interactive grid ignition (`click` on healthy cell sends `ignite` command to backend)
- Live process manager and priority queue visualization
- Real-time statistics & performance comparison charts

### Backend (Python + FastAPI)
- 20x20 grid state representation & probabilistic 2-stage fire propagation algorithms
- Asynchronous `ConnectionManager` handling WebSocket lifecycle and playback tick loops
- REST endpoints (`/health`, `/simulation/reset`, `/simulation/ignite`, `/simulation/step`, `/simulation/state`)
- High-frequency state streaming over WebSockets

---

## WebSocket Communication Protocol (`/ws/simulation`)

### Connection Endpoint
`ws://localhost:8000/ws/simulation` (or proxied via `/ws/simulation`)

### Connection Lifecycle
1. **Client Connection**: When the frontend mounts, `SimulationSocketService` opens a WebSocket connection.
2. **Initial State Broadcast**: Upon connection acceptance, the backend immediately broadcasts the full 20x20 `SimulationStateModel` JSON.
3. **Command Processing**: The client sends JSON command objects (`start`, `pause`, `reset`, `step`, `ignite`, `set_speed`).
4. **Real-time Tick Loop**: When `is_running` is `True`, an `asyncio` loop advances the engine periodically (`sleep_delay = 1.0 / speed`) and broadcasts the updated state matrix.
5. **Clean Disconnect**: Disconnections are handled gracefully without throwing exceptions or blocking the event loop.

### Client → Server Commands (JSON)

#### Start / Resume Simulation
```json
{ "type": "start" }
```

#### Pause Simulation
```json
{ "type": "pause" }
```

#### Reset Simulation
```json
{ "type": "reset" }
```

#### Single Step Simulation
```json
{ "type": "step" }
```

#### Ignite Specific Cell
```json
{
  "type": "ignite",
  "row": 10,
  "col": 10
}
```

#### Set Playback Speed Multiplier
```json
{
  "type": "set_speed",
  "speed": 2.0
}
```

### Server → Client State Message Format (JSON)
```json
{
  "grid": [
    ["healthy", "healthy", ...],
    ["healthy", "burning", ...]
  ],
  "simulation_time": 12,
  "is_running": true,
  "speed": 2.0,
  "burning_cells": 5,
  "burned_cells": 8,
  "healthy_cells": 345,
  "water_cells": 42,
  "total_cells": 400
}
```
