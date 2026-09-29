from typing import List, Optional, Tuple, Dict, Any
from simulation.simulator import WildfireSimulator
from simulation.models import (
    CellState,
    ComparisonRequestModel,
    ComparisonResponseModel,
    DetectionRunResult,
    ComparisonSummaryModel,
    ComparisonTimeSeriesPoint,
)


def run_single_detection_pass(
    detection_delay: int,
    config: ComparisonRequestModel,
) -> Tuple[DetectionRunResult, List[Dict[str, int]]]:
    """Execute a single deterministic simulation pass with a specific detection delay.

    Returns the calculated run metrics and the step-by-step history series.
    """
    simulator = WildfireSimulator(
        spread_probability=config.spread_probability,
        burn_duration=config.burn_duration,
        seed=config.seed,
        detection_delay=detection_delay,
    )
    simulator.set_wind(config.wind_direction, config.wind_strength)

    # Ignite target cell
    simulator.ignite(config.ignition_row, config.ignition_col)

    # Track metrics
    history: List[Dict[str, int]] = []
    peak_burning = 0
    containment_step: Optional[int] = None

    # Step 0 record
    initial_burning = len(simulator.grid.get_cells_by_state(CellState.BURNING))
    initial_burned = len(simulator.grid.get_cells_by_state(CellState.BURNED))
    peak_burning = max(peak_burning, initial_burning)
    history.append({
        "step": 0,
        "burning": initial_burning,
        "burned": initial_burned,
    })

    # Run loop
    for step_num in range(1, config.max_steps + 1):
        simulator.step()
        burning_count = len(simulator.grid.get_cells_by_state(CellState.BURNING))
        burned_count = len(simulator.grid.get_cells_by_state(CellState.BURNED))

        peak_burning = max(peak_burning, burning_count)

        history.append({
            "step": step_num,
            "burning": burning_count,
            "burned": burned_count,
        })

        if burning_count == 0 and containment_step is None:
            containment_step = step_num
            break

    # Resource usage counts
    ff_res = simulator.resource_manager.get_resource("Firefighters")
    water_res = simulator.resource_manager.get_resource("Water Supply")
    drone_res = simulator.resource_manager.get_resource("Surveillance Drones")

    ff_allocated = 6 if simulator._emergency_allocated else 0
    water_allocated = 20 if simulator._emergency_allocated else 0
    drones_allocated = 2 if simulator._emergency_allocated else 0

    total_burned = len(simulator.grid.get_cells_by_state(CellState.BURNED))
    grid_total = simulator.grid.rows * simulator.grid.cols
    fire_spread_percent = f"{(total_burned / grid_total) * 100:.1f}%"

    mode_label = "EARLY" if detection_delay == 0 else "LATE"
    run_result = DetectionRunResult(
        mode=mode_label,
        detection_time=simulator.sensor_manager.first_detection_time,
        detection_delay=detection_delay,
        containment_time=containment_step,
        contained=containment_step is not None,
        total_burned_cells=total_burned,
        peak_burning_cells=peak_burning,
        fire_spread_percent=fire_spread_percent,
        firefighters_allocated=ff_allocated,
        water_allocated=water_allocated,
        drones_allocated=drones_allocated,
        total_steps=len(history) - 1,
    )

    return run_result, history


def run_detection_comparison(
    config: Optional[ComparisonRequestModel] = None,
) -> ComparisonResponseModel:
    """Execute both Early and Late detection runs under identical initial conditions.

    Calculates comparative metrics, step-by-step telemetry, and deltas.
    """
    if config is None:
        config = ComparisonRequestModel()

    # 1. Early Detection Pass (delay = 0)
    early_result, early_history = run_single_detection_pass(
        detection_delay=0,
        config=config,
    )

    # 2. Late Detection Pass (delay = config.late_detection_delay)
    late_result, late_history = run_single_detection_pass(
        detection_delay=config.late_detection_delay,
        config=config,
    )

    # 3. Merge Step-by-Step Time Series
    max_steps_observed = max(len(early_history), len(late_history))
    time_series: List[ComparisonTimeSeriesPoint] = []

    for i in range(max_steps_observed):
        early_pt = early_history[min(i, len(early_history) - 1)]
        late_pt = late_history[min(i, len(late_history) - 1)]

        step_sec = i
        formatted_time = f"{step_sec // 60:02d}:{step_sec % 60:02d}"

        time_series.append(
            ComparisonTimeSeriesPoint(
                step=i,
                time=formatted_time,
                early_burned=early_pt["burned"],
                early_burning=early_pt["burning"],
                late_burned=late_pt["burned"],
                late_burning=late_pt["burning"],
            )
        )

    # 4. Compute Summary / Deltas
    burned_diff = late_result.total_burned_cells - early_result.total_burned_cells
    peak_diff = late_result.peak_burning_cells - early_result.peak_burning_cells

    containment_diff: Optional[int] = None
    if late_result.containment_time is not None and early_result.containment_time is not None:
        containment_diff = late_result.containment_time - early_result.containment_time

    detection_diff: Optional[int] = None
    if late_result.detection_time is not None and early_result.detection_time is not None:
        detection_diff = late_result.detection_time - early_result.detection_time

    saved_percent = (
        f"{(burned_diff / late_result.total_burned_cells) * 100:.1f}%"
        if late_result.total_burned_cells > 0
        else "0.0%"
    )

    summary = ComparisonSummaryModel(
        burned_cells_difference=burned_diff,
        containment_time_difference=containment_diff,
        peak_burning_difference=peak_diff,
        detection_time_difference=detection_diff,
        saved_cells_percent=saved_percent,
    )

    return ComparisonResponseModel(
        config=config,
        early=early_result,
        late=late_result,
        summary=summary,
        time_series=time_series,
    )
