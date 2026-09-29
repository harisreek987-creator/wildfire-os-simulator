from typing import Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from simulation.simulator import WildfireSimulator
from simulation.models import (
    SimulationStateModel,
    IgniteRequest,
    ComparisonRequestModel,
    ComparisonResponseModel,
)
from simulation.comparison import run_detection_comparison
from simulation.ws_manager import ConnectionManager

app = FastAPI(
    title="Wildfire OS Simulator Engine",
    description="Backend simulation engine and OS scheduler",
    version="0.3.0",
)

# Enable CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Single simulation instance and WebSocket manager
simulator = WildfireSimulator()
manager = ConnectionManager(simulator)


@app.get("/health")
def health_check():
    """Health check endpoint to verify backend service status."""
    return {"status": "ok"}


@app.websocket("/ws/simulation")
async def websocket_simulation(websocket: WebSocket):
    """WebSocket endpoint for real-time bidirectional simulation control and streaming."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.handle_command(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


# REST endpoints preserved for direct testing & compatibility
@app.get("/simulation/state", response_model=SimulationStateModel)
def get_simulation_state():
    """Returns current 20x20 simulation grid state and stats."""
    return simulator.get_state()


@app.post("/simulation/reset", response_model=SimulationStateModel)
def reset_simulation():
    """Resets grid to initial forest layout and resets clock."""
    res = simulator.reset()
    # Trigger broadcast to any connected WS clients
    asyncio_loop_broadcast()
    return res


@app.post("/simulation/ignite", response_model=SimulationStateModel)
def ignite_cell(req: IgniteRequest):
    """Ignites cell at specified (row, col) coordinates."""
    if not simulator.grid.is_valid_coord(req.row, req.col):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid grid coordinates ({req.row}, {req.col}). Grid dimensions are 20x20.",
        )

    success = simulator.ignite(req.row, req.col)
    if not success:
        cell = simulator.grid.get_cell(req.row, req.col)
        state_str = (
            cell.state.value if hasattr(cell.state, "value") else str(cell.state)
        ) if cell else "unknown"
        raise HTTPException(
            status_code=400,
            detail=f"Cell ({req.row}, {req.col}) cannot be ignited (current state: {state_str}).",
        )

    asyncio_loop_broadcast()
    return simulator.get_state()


@app.post("/simulation/step", response_model=SimulationStateModel)
def step_simulation():
    """Executes a single fire propagation step."""
    res = simulator.step()
    asyncio_loop_broadcast()
    return res


@app.post("/simulation/compare-detection", response_model=ComparisonResponseModel)
def compare_detection_experiment(req: Optional[ComparisonRequestModel] = None):
    """Run controlled Early vs Late detection simulation experiment with real comparative metrics."""
    return run_detection_comparison(req)


@app.get("/simulation/compare-detection", response_model=ComparisonResponseModel)
def get_default_detection_comparison():
    """Returns default baseline Early vs Late detection experiment results."""
    return run_detection_comparison(ComparisonRequestModel())


def asyncio_loop_broadcast():
    """Helper to schedule WebSocket broadcast from synchronous REST routes."""
    import asyncio
    try:
        loop = asyncio.get_running_loop()
        if loop.is_running():
            loop.create_task(manager.broadcast_state())
    except RuntimeError:
        pass

