import random
from typing import List, Tuple, Optional
from simulation.grid import Grid
from simulation.models import CellState, WindModel, WindDirection, WindStrength

DEFAULT_SPREAD_PROBABILITY = 0.35
DEFAULT_BURN_DURATION = 3


def calculate_wind_multiplier(
    source_row: int,
    source_col: int,
    neighbor_row: int,
    neighbor_col: int,
    wind: WindModel,
) -> float:
    """Calculate directional spread probability multiplier based on wind vector and neighbor orientation.

    Wind Direction Convention:
      - NORTH: Fire spreads toward decreasing row values (row - 1).
      - SOUTH: Fire spreads toward increasing row values (row + 1).
      - EAST: Fire spreads toward increasing column values (col + 1).
      - WEST: Fire spreads toward decreasing column values (col - 1).
    """
    dr = neighbor_row - source_row
    dc = neighbor_col - source_col

    dir_str = str(wind.direction.value if hasattr(wind.direction, "value") else wind.direction)
    strength_str = str(wind.strength.value if hasattr(wind.strength, "value") else wind.strength)

    # Determine direction category: "DOWNWIND", "UPWIND", or "CROSSWIND"
    category = "CROSSWIND"
    if dir_str == "NORTH":
        if dr == -1 and dc == 0:
            category = "DOWNWIND"
        elif dr == 1 and dc == 0:
            category = "UPWIND"
    elif dir_str == "SOUTH":
        if dr == 1 and dc == 0:
            category = "DOWNWIND"
        elif dr == -1 and dc == 0:
            category = "UPWIND"
    elif dir_str == "EAST":
        if dr == 0 and dc == 1:
            category = "DOWNWIND"
        elif dr == 0 and dc == -1:
            category = "UPWIND"
    elif dir_str == "WEST":
        if dr == 0 and dc == -1:
            category = "DOWNWIND"
        elif dr == 0 and dc == 1:
            category = "UPWIND"

    # Multiplier table based on wind strength
    if strength_str == "LOW":
        multipliers = {"DOWNWIND": 1.2, "CROSSWIND": 1.0, "UPWIND": 0.8}
    elif strength_str == "HIGH":
        multipliers = {"DOWNWIND": 2.0, "CROSSWIND": 1.0, "UPWIND": 0.25}
    else:  # MEDIUM
        multipliers = {"DOWNWIND": 1.5, "CROSSWIND": 1.0, "UPWIND": 0.5}

    return multipliers.get(category, 1.0)


class FireSpreadEngine:
    """Calculates probabilistic fire propagation across grid neighbors with wind influence."""

    def __init__(
        self,
        spread_probability: float = DEFAULT_SPREAD_PROBABILITY,
        burn_duration: int = DEFAULT_BURN_DURATION,
        rng: Optional[random.Random] = None,
    ):
        self.spread_probability = spread_probability
        self.burn_duration = burn_duration
        self.rng = rng or random.Random()

    def set_seed(self, seed: int) -> None:
        """Set seed for deterministic random testing."""
        self.rng = random.Random(seed)

    def step(
        self,
        grid: Grid,
        wind: Optional[WindModel] = None,
        suppression_factor: float = 1.0,
    ) -> Tuple[int, int]:
        """Performs a single propagation tick on grid using wind-aware probability.

        Returns (new_ignitions_count, newly_burned_count).
        Uses 2-stage evaluation to avoid inconsistent grid iteration mutations.
        """
        if wind is None:
            wind = WindModel()

        burning_cells = grid.get_cells_by_state(CellState.BURNING)

        new_ignitions: List[Tuple[int, int]] = []
        cells_to_burn_out: List[Tuple[int, int]] = []

        # Stage 1: Identify neighbors to ignite & burning cells to extinguish
        for cell in burning_cells:
            neighbors = grid.get_cardinal_neighbors(cell.row, cell.col)
            for neighbor in neighbors:
                neighbor_state = str(
                    neighbor.state.value if hasattr(neighbor.state, "value") else neighbor.state
                )
                if neighbor_state == str(CellState.HEALTHY.value):
                    if (neighbor.row, neighbor.col) not in new_ignitions:
                        # Calculate wind-modified probability
                        multiplier = calculate_wind_multiplier(
                            cell.row, cell.col, neighbor.row, neighbor.col, wind
                        )
                        eff_prob = min(1.0, max(0.0, self.spread_probability * multiplier * suppression_factor))

                        if self.rng.random() < eff_prob:
                            new_ignitions.append((neighbor.row, neighbor.col))

            # Increment burn duration counter
            cell.burn_counter += 1
            if cell.burn_counter >= self.burn_duration:
                cells_to_burn_out.append((cell.row, cell.col))

        # Stage 2: Apply updates safely
        for r, c in new_ignitions:
            grid.set_cell_state(r, c, CellState.BURNING)

        for r, c in cells_to_burn_out:
            grid.set_cell_state(r, c, CellState.BURNED)

        return len(new_ignitions), len(cells_to_burn_out)
