import pytest
from simulation.simulator import WildfireSimulator
from simulation.models import WindDirection, WindStrength, WindModel
from simulation.fire import calculate_wind_multiplier


def test_default_wind_state():
    """1. Default wind state is NORTH, MEDIUM."""
    simulator = WildfireSimulator()
    assert simulator.wind.direction == WindDirection.NORTH
    assert simulator.wind.strength == WindStrength.MEDIUM


def test_change_wind_direction():
    """2. Changing wind direction."""
    simulator = WildfireSimulator()
    simulator.set_wind("EAST", "MEDIUM")
    assert simulator.wind.direction == WindDirection.EAST


def test_change_wind_strength():
    """3. Changing wind strength."""
    simulator = WildfireSimulator()
    simulator.set_wind("NORTH", "HIGH")
    assert simulator.wind.strength == WindStrength.HIGH


def test_invalid_wind_values_handled_safely():
    """4. Invalid wind values are rejected safely."""
    simulator = WildfireSimulator()
    prev_dir = simulator.wind.direction
    prev_str = simulator.wind.strength

    simulator.set_wind("INVALID_DIR", "HIGH")
    assert simulator.wind.direction == prev_dir

    simulator.set_wind("EAST", "ULTRA_STRONG")
    assert simulator.wind.strength == prev_str


def test_wind_in_serialized_state():
    """5. Wind state appears in serialized simulation state."""
    simulator = WildfireSimulator()
    simulator.set_wind("WEST", "LOW")
    state = simulator.get_state_dict()

    assert "wind" in state
    assert state["wind"]["direction"] == "WEST"
    assert state["wind"]["strength"] == "LOW"


def test_directional_probability_changes_with_wind():
    """6. Directional probability changes according to wind direction."""
    wind = WindModel(direction=WindDirection.EAST, strength=WindStrength.MEDIUM)

    # Source (10, 10) -> Neighbor East (10, 11) is DOWNWIND
    downwind_mult = calculate_wind_multiplier(10, 10, 10, 11, wind)
    assert downwind_mult == 1.5

    # Neighbor West (10, 9) is UPWIND
    upwind_mult = calculate_wind_multiplier(10, 10, 10, 9, wind)
    assert upwind_mult == 0.5

    # Neighbor North (9, 10) is CROSSWIND
    crosswind_mult = calculate_wind_multiplier(10, 10, 9, 10, wind)
    assert crosswind_mult == 1.0


def test_higher_wind_strength_produces_stronger_influence():
    """7. Higher wind strength produces stronger directional influence."""
    wind_low = WindModel(direction=WindDirection.NORTH, strength=WindStrength.LOW)
    wind_high = WindModel(direction=WindDirection.NORTH, strength=WindStrength.HIGH)

    # Source (10, 10) -> North neighbor (9, 10) is DOWNWIND
    mult_low = calculate_wind_multiplier(10, 10, 9, 10, wind_low)
    mult_high = calculate_wind_multiplier(10, 10, 9, 10, wind_high)

    assert mult_low == 1.2
    assert mult_high == 2.0
    assert mult_high > mult_low
