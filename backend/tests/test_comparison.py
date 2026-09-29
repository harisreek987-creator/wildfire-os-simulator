import pytest
from fastapi.testclient import TestClient
from main import app
from simulation.models import ComparisonRequestModel, WindDirection, WindStrength
from simulation.comparison import run_detection_comparison, run_single_detection_pass


def test_early_and_late_runs_execute_successfully():
    """1. Both early and late simulation passes execute and return complete metrics."""
    result = run_detection_comparison()
    assert result.early is not None
    assert result.late is not None
    assert result.summary is not None
    assert len(result.time_series) > 0

    assert result.early.mode == "EARLY"
    assert result.late.mode == "LATE"
    assert result.early.total_burned_cells >= 0
    assert result.late.total_burned_cells >= 0


def test_same_base_simulation_configuration():
    """2. Both runs use the exact same base configuration."""
    config = ComparisonRequestModel(
        ignition_row=10,
        ignition_col=10,
        wind_direction=WindDirection.NORTH,
        wind_strength=WindStrength.MEDIUM,
        spread_probability=0.35,
        burn_duration=3,
        late_detection_delay=6,
        seed=42,
    )
    result = run_detection_comparison(config)

    assert result.config.ignition_row == 10
    assert result.config.ignition_col == 10
    assert result.config.wind_direction == WindDirection.NORTH
    assert result.config.wind_strength == WindStrength.MEDIUM
    assert result.config.seed == 42


def test_detection_timing_differs_according_to_delay():
    """3. Detection timing differs according to configured late_detection_delay."""
    config = ComparisonRequestModel(late_detection_delay=8, seed=42)
    result = run_detection_comparison(config)

    assert result.early.detection_delay == 0
    assert result.late.detection_delay == 8
    if result.early.detection_time is not None and result.late.detection_time is not None:
        assert result.late.detection_time >= result.early.detection_time + 8


def test_results_deterministic_with_same_seed():
    """4. Results are completely deterministic when executed with the same seed."""
    config = ComparisonRequestModel(seed=99, late_detection_delay=5)
    run1 = run_detection_comparison(config)
    run2 = run_detection_comparison(config)

    assert run1.early.total_burned_cells == run2.early.total_burned_cells
    assert run1.late.total_burned_cells == run2.late.total_burned_cells
    assert run1.early.peak_burning_cells == run2.early.peak_burning_cells
    assert run1.late.peak_burning_cells == run2.late.peak_burning_cells
    assert len(run1.time_series) == len(run2.time_series)


def test_early_detection_achieves_better_containment():
    """5. Early detection contains fire with fewer burned cells and lower peak fire size."""
    config = ComparisonRequestModel(late_detection_delay=6, seed=42)
    result = run_detection_comparison(config)

    assert result.early.total_burned_cells < result.late.total_burned_cells
    assert result.early.peak_burning_cells < result.late.peak_burning_cells
    assert result.summary.burned_cells_difference > 0


def test_comparison_rest_endpoint():
    """6. REST endpoint POST /simulation/compare-detection returns valid comparison payload."""
    client = TestClient(app)
    response = client.post("/simulation/compare-detection", json={
        "ignition_row": 10,
        "ignition_col": 10,
        "late_detection_delay": 5,
        "seed": 42,
    })
    assert response.status_code == 200
    data = response.json()

    assert "early" in data
    assert "late" in data
    assert "summary" in data
    assert "time_series" in data
    assert data["early"]["mode"] == "EARLY"
    assert data["late"]["mode"] == "LATE"
    assert data["summary"]["burned_cells_difference"] >= 0


def test_comparison_get_default_endpoint():
    """7. REST endpoint GET /simulation/compare-detection returns baseline results."""
    client = TestClient(app)
    response = client.get("/simulation/compare-detection")
    assert response.status_code == 200
    data = response.json()
    assert "early" in data
    assert "late" in data
    assert len(data["time_series"]) > 0
