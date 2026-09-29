# Wildfire OS Simulator — Command Center & Operating Systems Working Model

An interactive educational Operating Systems working model demonstrating wildfire propagation, early versus late sensor detection comparison, and core operating system primitives: **Virtual Processes & PCBs**, **Preemptive Priority Scheduling**, **IPC Event Queue**, and **System Resource Allocation**.

---

## 1. Project Purpose & OS Viva Concepts

This project models an emergency management wildfire command center as an educational Virtual Operating System. It provides clear, demonstrable mappings between physical wildfire emergency response and foundational OS concepts:

| Operating System Concept | Wildfire Simulator Implementation |
|---|---|
| **Process Control Block (PCB)** | `VirtualProcess` tracking PID, priority, scheduling rank, state, execution ticks, CPU load, and wait reasons. |
| **Process Lifecycle States** | Processes transition dynamically through `READY`, `RUNNING`, `WAITING`, and `COMPLETED`. |
| **Priority-Based Preemptive Scheduling** | `PriorityScheduler` dispatches the highest-priority ready process each tick. Emergency Response (`PID 104`, Rank 1) preempts lower-priority tasks upon fire detection alert. |
| **Inter-Process Communication (IPC)** | FIFO `EventQueue` buffering IPC events (`IGNITION`, `FIRE_SPREAD`, `SENSOR_DETECTION`, `ALERT`, `EMERGENCY_RESPONSE`, `RESOURCE_ALLOCATION`). |
| **Mutual Exclusion & Resource Allocation** | `ResourceManager` managing finite pools of Firefighters, Water Supply, and Surveillance Drones with concurrency tracking and wait states. |
| **Comparative Benchmark Experiment** | Controlled Early vs. Late Detection benchmark proving containment speedup and saved forest cells using deterministic seeds. |

---

## 2. System Architecture

The project employs a clean hybrid architecture:
- **Backend (Python Engine)**: FastAPI, WebSockets, Pydantic, Uvicorn. Houses the 20×20 cellular automata fire spread simulation, wind vectors, sensor telemetry, scheduler, event queue, and comparative experiment runner.
- **Frontend (Command Center UI)**: React, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts. Renders the interactive command center dashboard, radar coverage overlay, process table, resource bars, live IPC event feed, and progression charts.

```
React Frontend (UI Dashboard & Controls)
         ↓ ↑ (WebSocket Streaming ws://localhost:8000/ws/simulation)
FastAPI Backend (ConnectionManager & REST Endpoints)
         ↓ ↑
Simulation Engine (Grid State, Wind System, Priority Scheduler, IPC Queue, Resource Allocator)
```

---

## 3. Getting Started

### Prerequisites
- Python 3.10+ (tested with Python 3.10–3.14)
- Node.js 18+ and npm

### Backend Setup & Verification

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt

# Run unit and integration tests (54 passing tests)
py -3 -m pytest tests

# Start the simulation engine server
uvicorn main:app --reload --port 8000
```
Backend health check: [http://localhost:8000/health](http://localhost:8000/health)

### Frontend Setup & Build

```bash
cd frontend
npm install

# Run production build (type checking + bundling)
npm run build

# Start local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. Interactive Simulation Features

- **20×20 Cellular Automata Grid**: Visualizes healthy forest, active fire, burned/charred cells, and water barriers with radar coverage toggle.
- **Interactive Manual Ignition**: Click any healthy forest cell to manually trigger an ignition event.
- **Atmospheric Wind Vector**: Adjust wind direction (`NORTH`, `SOUTH`, `EAST`, `WEST`) and strength (`LOW`, `MEDIUM`, `HIGH`) to influence propagation probabilities.
- **Simulation Controls**: `START`, `PAUSE`, `RESUME`, `STEP` (advance by exactly 1 tick), `RESET`, and variable playback speeds (1x, 2x, 5x, 10x).
- **Quick Scenario Presets**:
  - `Standard`: Northern wind, medium speed, center ignition.
  - `High Gale`: Western wind at maximum strength.
  - `Rapid Spread`: Southern wind with high propagation velocity.
  - `Perimeter Test`: Eastern wind targeting perimeter sensor nodes.
- **Early vs. Late Detection Benchmark**: Real-time side-by-side experiment comparing instant alert vs. configurable delayed alert (4s, 6s, 8s, 10s), complete with damage mitigation percentages and Recharts fire progression curves.

---

## 5. Documentation Reference

Detailed OS viva and architectural specifications are located in `docs/`:
- [`docs/architecture.md`](docs/architecture.md) — System design, WebSocket protocol, and data schemas.
- [`docs/simulation.md`](docs/simulation.md) — Cellular automata math, wind modifiers, and sensor detection mechanics.
- [`docs/os-concepts.md`](docs/os-concepts.md) — Virtual PCB specification, priority scheduling algorithm, IPC event queue, and resource synchronization.

---

## 6. Scope & Educational Limitations

This project is strictly designed as an **educational Operating Systems working model** for academic viva and demonstration purposes. It does not use real-world GIS coordinates, weather APIs, or machine learning physics models.
