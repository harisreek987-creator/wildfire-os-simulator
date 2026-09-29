from typing import List, Tuple, Optional
from simulation.models import CellState, CellModel

GRID_ROWS = 20
GRID_COLS = 20


class Grid:
    """Represents the 20x20 forest grid environment."""

    def __init__(self, rows: int = GRID_ROWS, cols: int = GRID_COLS):
        self.rows = rows
        self.cols = cols
        self._cells: List[List[CellModel]] = []
        self.initialize_grid()

    def initialize_grid(self, water_layout: Optional[List[Tuple[int, int]]] = None) -> None:
        """Initialize or reset grid cells to healthy forest state with default water barriers."""
        self._cells = [
            [
                CellModel(row=r, col=c, state=CellState.HEALTHY, burn_counter=0)
                for c in range(self.cols)
            ]
            for r in range(self.rows)
        ]

        # Apply default water layout if none provided
        if water_layout is None:
            water_layout = self._get_default_water_layout()

        for r, c in water_layout:
            if self.is_valid_coord(r, c):
                self._cells[r][c].state = CellState.WATER

    def _get_default_water_layout(self) -> List[Tuple[int, int]]:
        """Default water body region matching the 20x20 visualization spec."""
        water_cells: List[Tuple[int, int]] = []
        for r in range(4, 14):
            for c in range(14, 17):
                water_cells.append((r, c))
        for r in range(7, 12):
            water_cells.append((r, 13))
        return water_cells

    def is_valid_coord(self, row: int, col: int) -> bool:
        """Check if coordinates lie within grid bounds."""
        return 0 <= row < self.rows and 0 <= col < self.cols

    def get_cell(self, row: int, col: int) -> Optional[CellModel]:
        """Retrieve cell object at specified row and column."""
        if not self.is_valid_coord(row, col):
            return None
        return self._cells[row][col]

    def set_cell_state(self, row: int, col: int, state: CellState) -> bool:
        """Safely set state of cell at (row, col). Returns True if successful."""
        cell = self.get_cell(row, col)
        if cell is None:
            return False
        cell.state = state
        if str(state) != str(CellState.BURNING.value):
            cell.burn_counter = 0
        return True

    def get_cardinal_neighbors(self, row: int, col: int) -> List[CellModel]:
        """Return cardinal neighbors (NORTH, SOUTH, EAST, WEST)."""
        cardinal_offsets = [(-1, 0), (1, 0), (0, 1), (0, -1)]  # N, S, E, W
        neighbors: List[CellModel] = []
        for dr, dc in cardinal_offsets:
            nr, nc = row + dr, col + dc
            if self.is_valid_coord(nr, nc):
                neighbors.append(self._cells[nr][nc])
        return neighbors

    def get_cells_by_state(self, state: CellState) -> List[CellModel]:
        """Get all cells currently matching a given state."""
        target_val = str(state.value if hasattr(state, "value") else state)
        result: List[CellModel] = []
        for row in self._cells:
            for cell in row:
                cell_val = str(cell.state.value if hasattr(cell.state, "value") else cell.state)
                if cell_val == target_val:
                    result.append(cell)
        return result

    def get_state_matrix(self) -> List[List[str]]:
        """Return 20x20 2D array of cell state strings."""
        return [
            [
                str(cell.state.value if hasattr(cell.state, "value") else cell.state)
                for cell in row
            ]
            for row in self._cells
        ]
