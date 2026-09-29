import pytest
from simulation.simulator import WildfireSimulator
from simulation.sensor import SensorManager
from simulation.models import SensorStatus


def get_status_str(sensor) -> str:
    return str(sensor.status.value if hasattr(sensor.status, "value") else sensor.status)


def test_default_sensors_created():
    """1. Default sensors are created."""
    sm = SensorManager()
    sensors = sm.get_sensor_models()
    assert len(sensors) == 4
    sensor_ids = [s.id for s in sensors]
    assert "S-01" in sensor_ids
    assert "S-02" in sensor_ids


def test_sensor_positions_valid():
    """2. Sensor positions are valid (0 <= row < 20, 0 <= col < 20)."""
    sm = SensorManager()
    for s in sm.get_sensor_models():
        assert 0 <= s.row < 20
        assert 0 <= s.col < 20
        assert s.detection_radius > 0


def test_burning_cell_inside_radius_detected():
    """3 & 4 & 6 & 7: Burning cell inside radius triggers DETECTED and records time."""
    simulator = WildfireSimulator()
    # Sensor S-02 is at (10, 10) with radius 4.0
    # Ignite at (10, 10) directly inside radius
    simulator.ignite(10, 10)

    sensor_s02 = [s for s in simulator.sensor_manager.sensors if s.id == "S-02"][0]
    assert get_status_str(sensor_s02) == "DETECTED"
    assert sensor_s02.detected_at == 0
    assert simulator.sensor_manager.first_detection_time == 0


def test_burning_cell_outside_radius_not_detected():
    """5. Burning cell outside radius is not detected."""
    simulator = WildfireSimulator()
    # S-01 is at (5, 5) with radius 3.0
    # Ignite at (0, 0) -> distance = sqrt(25 + 25) = 7.07 > 3.0
    simulator.ignite(0, 0)

    sensor_s01 = [s for s in simulator.sensor_manager.sensors if s.id == "S-01"][0]
    assert get_status_str(sensor_s01) == "MONITORING"
    assert sensor_s01.detected_at is None


def test_reset_clears_sensor_detection_state():
    """8. Reset clears sensor detection state."""
    simulator = WildfireSimulator()
    simulator.ignite(10, 10)

    # Confirm sensor triggered
    sensor_s02 = [s for s in simulator.sensor_manager.sensors if s.id == "S-02"][0]
    assert get_status_str(sensor_s02) == "DETECTED"

    # Perform reset
    simulator.reset()
    sensor_s02_reset = [s for s in simulator.sensor_manager.sensors if s.id == "S-02"][0]
    assert get_status_str(sensor_s02_reset) == "MONITORING"
    assert sensor_s02_reset.detected_at is None
    assert simulator.sensor_manager.first_detection_time is None


def test_sensor_state_serialized_correctly():
    """9. Sensor state is serialized correctly."""
    simulator = WildfireSimulator()
    simulator.ignite(10, 10)
    state = simulator.get_state_dict()

    assert "sensors" in state
    assert len(state["sensors"]) == 4
    s02 = [s for s in state["sensors"] if s["id"] == "S-02"][0]
    assert s02["status"] == "DETECTED"
    assert state["first_detection_time"] == 0


def test_multiple_sensors_detect_same_fire():
    """10. Multiple sensors can detect the same fire if inside their respective radii."""
    simulator = WildfireSimulator()
    # Modify S-01 position to (10, 8) so fire at (10, 9) falls inside both S-01 and S-02
    simulator.sensor_manager.sensors[0].row = 10
    simulator.sensor_manager.sensors[0].col = 8

    simulator.ignite(10, 9)

    s01 = simulator.sensor_manager.sensors[0]
    s02 = [s for s in simulator.sensor_manager.sensors if s.id == "S-02"][0]

    assert get_status_str(s01) == "DETECTED"
    assert get_status_str(s02) == "DETECTED"
