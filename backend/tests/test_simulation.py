import json
import pytest
from simulation.grid import Grid, GRID_ROWS, GRID_COLS
from simulation.models import CellState
from simulation.simulator import WildfireSimulator


def get_state_val(cell) -> str:
    """Helper to extract string state value from cell."""
    if cell is None:
        return ""
    return str(cell.state.value if hasattr(cell.state, "value") else cell.state)


def test_grid_initialization_20x20():
    """1. Grid initializes to 20x20."""
    grid = Grid(rows=20, cols=20)
    assert grid.rows == 20
    assert grid.cols == 20
    matrix = grid.get_state_matrix()
    assert len(matrix) == 20
    assert all(len(row) == 20 for row in matrix)


def test_initial_cell_states_valid():
    """2. All cells initially have valid states."""
    grid = Grid()
    valid_states = {"healthy", "water"}
    for row in range(grid.rows):
        for col in range(grid.cols):
            cell = grid.get_cell(row, col)
            assert cell is not None
            assert get_state_val(cell) in valid_states


def test_ignition_healthy_to_burning():
    """3. Ignition changes HEALTHY -> BURNING."""
    simulator = WildfireSimulator()
    # Cell (10, 10) is healthy in default grid layout
    cell = simulator.grid.get_cell(10, 10)
    assert cell is not None and get_state_val(cell) == "healthy"

    success = simulator.ignite(10, 10)
    assert success is True
    assert get_state_val(simulator.grid.get_cell(10, 10)) == "burning"


def test_invalid_coordinates_handled_safely():
    """4. Invalid coordinates are handled safely."""
    simulator = WildfireSimulator()
    assert simulator.ignite(-1, 5) is False
    assert simulator.ignite(20, 5) is False
    assert simulator.ignite(5, 25) is False
    assert simulator.grid.get_cell(-5, -5) is None


def test_burning_cell_eventually_burned():
    """5. A burning cell eventually becomes BURNED after burn duration."""
    simulator = WildfireSimulator(burn_duration=3, spread_probability=0.0)
    simulator.ignite(10, 10)

    # Step 1: burn_counter = 1
    simulator.step()
    assert get_state_val(simulator.grid.get_cell(10, 10)) == "burning"

    # Step 2: burn_counter = 2
    simulator.step()
    assert get_state_val(simulator.grid.get_cell(10, 10)) == "burning"

    # Step 3: burn_counter = 3 -> transitions to BURNED
    simulator.step()
    assert get_state_val(simulator.grid.get_cell(10, 10)) == "burned"


def test_fire_spread_to_neighboring_cells():
    """6. Fire can spread to neighboring cells."""
    # Use spread_probability = 1.0 to guarantee propagation on downwind & crosswind paths
    simulator = WildfireSimulator(spread_probability=1.0, burn_duration=3)
    simulator.ignite(10, 10)

    # Before step, neighbors are healthy
    neighbors = simulator.grid.get_cardinal_neighbors(10, 10)
    healthy_neighbors = [n for n in neighbors if get_state_val(n) == "healthy"]
    assert len(healthy_neighbors) == 4

    simulator.step()

    # After 1 step, downwind and crosswind neighbors ignite (NORTH wind: (9,10), (10,9), (10,11))
    assert get_state_val(simulator.grid.get_cell(9, 10)) == "burning"
    assert get_state_val(simulator.grid.get_cell(10, 9)) == "burning"
    assert get_state_val(simulator.grid.get_cell(10, 11)) == "burning"
    assert len(simulator.grid.get_cells_by_state(CellState.BURNING)) >= 4


def test_simulation_time_advances():
    """7. Simulation time advances correctly."""
    simulator = WildfireSimulator()
    assert simulator.simulation_time == 0
    simulator.ignite(5, 5)

    simulator.step()
    assert simulator.simulation_time == 1
    simulator.step()
    assert simulator.simulation_time == 2


def test_reset_returns_initial_state():
    """8. Reset returns the simulation to its initial state."""
    simulator = WildfireSimulator(spread_probability=1.0)
    simulator.ignite(5, 5)
    simulator.step()
    simulator.step()
    assert simulator.simulation_time == 2

    simulator.reset()
    assert simulator.simulation_time == 0
    assert simulator.is_running is False
    assert get_state_val(simulator.grid.get_cell(5, 5)) == "healthy"
    assert len(simulator.grid.get_cells_by_state(CellState.BURNING)) == 0
    assert len(simulator.grid.get_cells_by_state(CellState.BURNED)) == 0


def test_get_state_json_serializable():
    """9. get_state() returns JSON-serializable data."""
    simulator = WildfireSimulator()
    simulator.ignite(10, 10)
    simulator.step()

    state_dict = simulator.get_state_dict()
    # Verify JSON serialization works without error
    json_str = json.dumps(state_dict)
    assert isinstance(json_str, str)

    parsed = json.loads(json_str)
    assert parsed["simulation_time"] == 1
    assert parsed["burning_cells"] > 0
    assert len(parsed["grid"]) == 20


def test_water_cells_protected_from_fire():
    """10. WATER cells cannot catch fire & fire does not spread through WATER."""
    simulator = WildfireSimulator(spread_probability=1.0)

    # Pick a water cell from default layout: (5, 14) is water
    water_cell = simulator.grid.get_cell(5, 14)
    assert water_cell is not None and get_state_val(water_cell) == "water"

    # Attempt direct ignition on water cell
    success = simulator.ignite(5, 14)
    assert success is False
    assert get_state_val(simulator.grid.get_cell(5, 14)) == "water"

    # Ignite neighbor next to water cell: (5, 13)
    simulator.ignite(5, 13)
    simulator.step()

    # Neighboring water cell must remain WATER
    assert get_state_val(simulator.grid.get_cell(5, 14)) == "water"
