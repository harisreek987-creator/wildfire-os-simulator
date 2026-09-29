# WILDFIRE OS SIMULATOR — AGENT INSTRUCTIONS

## 1. Project Overview

Build an interactive educational Operating Systems working model called
"Wildfire OS Simulator".

The simulator demonstrates how a wildfire spreads through a grid-based
environment and how early versus late detection affects the final outcome.

The project should visually simulate:

- A grid-based forest
- Fire ignition and propagation
- Wind direction and wind strength
- Different terrain types
- Fire detection sensors
- Early and late detection
- Emergency alerts
- Process management
- Priority scheduling
- Event queues
- Basic resource allocation
- Simulation statistics

This is an educational OS simulation, NOT a real wildfire prediction
or emergency-management system.

---

## 2. Main Project Goal

The final application should look like a professional wildfire command
center while remaining simple enough for a college student to understand,
modify, explain and demonstrate during an OS viva.

The project must prioritize:

1. Reliability
2. Simplicity
3. Visual quality
4. Clear OS concepts
5. Easy demonstration
6. Maintainable code

Do not over-engineer the project.

---

## 3. Architecture

Use a hybrid architecture.

### Frontend

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Recharts when charts are required

The frontend is responsible for:

- User interface
- Grid visualization
- Animations
- Controls
- Statistics
- Charts
- Process visualization
- Event log
- Resource visualization
- Scenario selection

The frontend must NOT contain the main wildfire simulation logic.

---

### Backend

Use:

- Python
- FastAPI
- WebSocket
- Pydantic

The backend is responsible for:

- Simulation state
- Grid management
- Fire propagation
- Wind calculations
- Terrain behavior
- Sensor detection
- Event generation
- Process simulation
- Priority scheduling
- Resource allocation
- Simulation statistics

Python is the simulation engine.

React is the visualization/control layer.

Do not duplicate core simulation logic between frontend and backend.

---

## 4. Communication

Use WebSocket for real-time simulation updates.

The general architecture should be:

React Frontend
        ↓
FastAPI
        ↓
Simulation Engine
        ↓
WebSocket
        ↓
React UI

Use REST endpoints only where they simplify configuration,
health checks or simulation control.

Do not introduce unnecessary networking technologies.

---

## 5. Project Structure

Target structure:

wildfire-os-simulator/

├── AGENTS.md
├── README.md
├── docs/
│   ├── architecture.md
│   ├── simulation.md
│   └── os-concepts.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── hooks/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── backend/
    ├── main.py
    ├── simulation.py
    ├── models.py
    └── requirements.txt

This is the target architecture, not a requirement to create all files
immediately.

Create files only when their corresponding development phase requires them.

---

## 6. Simulation Model

Use a manageable grid.

Default grid:

20 × 20 cells.

Each cell should have a simple state.

Minimum states:

- healthy
- burning
- burned
- water

Additional terrain types may be introduced later if they provide
meaningful value without substantially increasing complexity.

---

## 7. Fire Propagation

Use a simple probabilistic neighbor-based fire-spread model.

For each burning cell:

1. Identify neighboring cells.
2. Determine whether the neighbor is burnable.
3. Calculate a base spread probability.
4. Modify probability according to wind.
5. Apply the resulting probability.
6. Ignite selected neighboring cells.
7. Convert previously burning cells to burned cells after their burn duration.

The model does NOT need to represent real wildfire physics.

Keep the algorithm understandable and explainable.

---

## 8. Wind System

Support four basic directions:

- NORTH
- SOUTH
- EAST
- WEST

Support adjustable wind strength.

Wind should influence fire spread probability.

The direction toward which the wind blows should receive a higher
spread probability.

Upwind cells should have a lower probability.

Use simple configurable parameters rather than complex atmospheric
physics.

---

## 9. Sensors

The simulation should contain multiple sensors.

Each sensor should have:

- ID
- Position
- Detection radius
- Status
- Detection timestamp when activated

A sensor detects a fire when a burning cell enters its detection radius.

Detection should generate an event.

Example:

FIRE IGNITION
      ↓
SENSOR DETECTION
      ↓
EVENT GENERATED
      ↓
EMERGENCY RESPONSE

---

## 10. Early vs Late Detection

This is the primary experiment of the project.

Support at least:

### Early Detection

Short detection delay.

### Late Detection

Longer detection delay.

The comparison should use the same:

- Initial grid
- Ignition location
- Wind direction
- Wind strength
- Terrain configuration

Only detection timing should differ.

The application should compare:

- Detection time
- Burned cells
- Fire spread
- Containment time
- Resource usage

The comparison must use actual simulation results.

Do not hard-code fake statistics.

---

## 11. OS Concepts

The project must demonstrate OS concepts clearly.

### Virtual Processes

Create logical processes such as:

1. Fire Spread
2. Sensor Monitor
3. Event Handler
4. Emergency Response
5. Statistics

Each process should have a state such as:

- READY
- RUNNING
- WAITING
- COMPLETED

---

## 12. Priority Scheduling

Implement a simple priority-based scheduler.

Emergency events should receive higher priority than normal monitoring
or statistics tasks.

Example conceptual priority:

Emergency Response → highest
Fire Spread → high
Sensor Monitor → medium
Statistics → low

The scheduler is an educational simulation.

It does not need to control real operating-system processes.

The UI should make the scheduling behavior visible.

---

## 13. Event Queue

Implement a simple event queue.

Possible events:

- IGNITION
- FIRE_SPREAD
- SENSOR_SCAN
- SENSOR_DETECTION
- ALERT
- EMERGENCY_RESPONSE
- RESOURCE_ALLOCATION
- FIRE_CONTAINED

Events should be displayed in a live event log.

---

## 14. Resource Management

Use a small set of simulated resources.

Examples:

- Firefighters
- Water
- Drones

Resources should have limited quantities.

Emergency response may consume resources.

The UI should show resource availability.

Do not build a complex resource-management system.

Keep it simple and visually understandable.

---

## 15. Frontend UI

The UI should look like a modern wildfire command center.

Preferred visual direction:

- Dark theme
- Professional
- Technical
- High contrast
- Clean typography
- Subtle animations
- Clear status indicators

Avoid:

- Cartoon-like styling
- Excessive gradients
- Excessive glassmorphism
- Unnecessary visual clutter

Main UI areas:

1. Header / system status
2. Fire grid
3. Simulation controls
4. Wind controls
5. Sensor status
6. Statistics
7. Process manager
8. Event log
9. Resource panel
10. Early vs late comparison

---

## 16. Grid Visualization

The grid should visually distinguish:

Healthy
Burning
Burned
Water
Sensors

Fire should have a visually noticeable animation.

Sensors should have a visible detection radius or indicator.

Wind direction should be visually represented.

The grid should remain readable even during rapid simulation.

---

## 17. Simulation Controls

Provide:

- Start
- Pause
- Resume
- Reset
- Simulation speed
- Wind direction
- Wind strength
- Detection mode

Potential later features:

- Random ignition
- Scenario presets
- Manual ignition

Only implement additional controls when they are useful.

---

## 18. Statistics

Display useful live statistics such as:

- Burned cells
- Burning cells
- Detection time
- Fire intensity
- Resources remaining
- Simulation time
- Active sensors

Use charts only when they improve understanding.

Do not add charts simply for decoration.

---

## 19. Development Phases

The application must be developed incrementally.

### Phase 0 — Project Setup

Create:

- frontend
- backend
- basic configuration
- development scripts
- health endpoint

Do not implement the wildfire simulation yet.

---

### Phase 1 — Frontend UI Shell

Create the complete visual interface using mock data.

Do not implement the real simulation yet.

---

### Phase 2 — Python Simulation Engine

Implement:

- 20×20 grid
- ignition
- fire propagation
- burned state
- reset
- simulation loop

Verify the simulation independently.

---

### Phase 3 — Backend/Frontend Integration

Connect React and Python.

Use WebSocket for live simulation state.

The React grid must display the real Python simulation.

---

### Phase 4 — Wind and Sensors

Implement:

- wind direction
- wind strength
- sensor locations
- sensor detection
- detection events

---

### Phase 5 — OS Simulation

Implement:

- virtual processes
- process states
- priority scheduling
- event queue
- resource allocation

---

### Phase 6 — Early vs Late Detection

Implement:

- early mode
- late mode
- comparison
- real calculated statistics

---

### Phase 7 — Final Polish

Add:

- animations
- charts
- scenario presets
- improved UX
- loading/error states
- responsive layout
- final documentation

Only add features that improve the actual demonstration.

---

## 20. Development Rules

IMPORTANT:

Do not build the entire application in one step.

Work one phase at a time.

After each phase:

1. Inspect the project.
2. Implement only that phase.
3. Run the application.
4. Run relevant tests or validation.
5. Fix errors.
6. Verify that existing functionality still works.
7. Summarize changes.
8. Stop and wait for the next phase instruction.

Do not automatically continue to the next phase.

---

## 21. Code Quality

Prefer:

- Simple functions
- Clear naming
- Small components
- Type safety
- Minimal dependencies
- Comments only where useful
- Reusable components
- Clear separation between simulation and UI

Avoid:

- Huge files
- Unnecessary abstractions
- Duplicate logic
- Magic numbers where configuration is appropriate
- Unused dependencies
- Dead code

---

## 22. Dependency Rules

Do not install libraries unless they are actually needed.

Current approved frontend dependencies:

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Recharts

Current approved backend dependencies:

- FastAPI
- Uvicorn
- WebSockets
- Pydantic

Additional libraries may be proposed when there is a clear reason.

Do not add databases, ML frameworks, authentication libraries,
cloud SDKs or other large dependencies unless explicitly requested.

---

## 23. Error Handling

The application should gracefully handle:

- Backend unavailable
- WebSocket disconnected
- Invalid simulation state
- Invalid control values
- Simulation errors

The UI should show a clear status such as:

ENGINE ONLINE
ENGINE OFFLINE
CONNECTING

Do not allow a backend failure to crash the entire frontend.

---

## 24. Performance

The simulation is educational and relatively small.

Target:

20×20 grid.

The application should remain smooth during normal operation.

Do not optimize prematurely.

If performance becomes an issue, diagnose the actual bottleneck before
introducing more complicated rendering technologies.

---

## 25. Testing

At minimum, verify:

- Fire spreads
- Fire does not spread through water
- Wind affects spread direction
- Sensors detect nearby fire
- Early detection happens before late detection
- Process states update
- Priority scheduling works
- Event queue records events
- Resources decrease appropriately
- Reset returns the simulation to its initial state
- WebSocket connection works

---

## 26. Documentation

Maintain:

README.md

docs/architecture.md

docs/simulation.md

docs/os-concepts.md

Documentation should explain the project in language suitable for a
college OS project and viva.

---

## 27. Important Scope Restriction

Do NOT add the following unless explicitly requested:

- Machine learning
- Real wildfire prediction
- Real weather APIs
- Satellite imagery
- GIS maps
- Database
- Authentication
- User accounts
- Cloud infrastructure
- Payment systems
- Complex physics
- Complex distributed systems
- Mobile application

The objective is a polished, understandable OS working model.

---

## 28. Agent Behavior

Before making significant architectural changes:

Explain the proposed change and its reason.

Never replace the existing technology stack without explicit approval.

Never delete working functionality merely to simplify implementation.

When an implementation choice is uncertain, prefer the simplest approach
that satisfies the requirements.

Always keep the project understandable to the student who will present it.
