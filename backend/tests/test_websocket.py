import json
import pytest
from fastapi.testclient import TestClient
from main import app, simulator


@pytest.fixture(autouse=True)
def reset_sim():
    """Reset simulation before each test."""
    simulator.reset()


def test_websocket_connection_and_initial_state():
    """1 & 2: WebSocket accepts connection and sends initial state."""
    client = TestClient(app)
    with client.websocket_connect("/ws/simulation") as websocket:
        data = websocket.receive_json()
        assert "grid" in data
        assert data["simulation_time"] == 0
        assert data["is_running"] is False
        assert len(data["grid"]) == 20


def test_websocket_step_command():
    """3: STEP command causes simulation time to advance."""
    client = TestClient(app)
    with client.websocket_connect("/ws/simulation") as websocket:
        _ = websocket.receive_json()  # Consume initial state

        # Ignite first, then step
        websocket.send_json({"type": "ignite", "row": 10, "col": 10})
        state_after_ignite = websocket.receive_json()
        assert state_after_ignite["burning_cells"] == 1

        websocket.send_json({"type": "step"})
        state_after_step = websocket.receive_json()
        assert state_after_step["simulation_time"] == 1


def test_websocket_ignite_command():
    """4: IGNITE command changes a healthy cell to burning."""
    client = TestClient(app)
    with client.websocket_connect("/ws/simulation") as websocket:
        _ = websocket.receive_json()

        websocket.send_json({"type": "ignite", "row": 5, "col": 5})
        state = websocket.receive_json()
        assert state["grid"][5][5] == "burning"
        assert state["burning_cells"] >= 1


def test_websocket_reset_command():
    """5: RESET returns simulation to initial state."""
    client = TestClient(app)
    with client.websocket_connect("/ws/simulation") as websocket:
        _ = websocket.receive_json()

        websocket.send_json({"type": "ignite", "row": 5, "col": 5})
        _ = websocket.receive_json()

        websocket.send_json({"type": "step"})
        _ = websocket.receive_json()

        websocket.send_json({"type": "reset"})
        reset_state = websocket.receive_json()

        assert reset_state["simulation_time"] == 0
        assert reset_state["is_running"] is False
        assert reset_state["grid"][5][5] == "healthy"
        assert reset_state["burning_cells"] == 0


def test_websocket_start_and_pause_commands():
    """6 & 7: START sets running to True, PAUSE sets running to False."""
    client = TestClient(app)
    with client.websocket_connect("/ws/simulation") as websocket:
        _ = websocket.receive_json()

        websocket.send_json({"type": "start"})
        start_state = websocket.receive_json()
        assert start_state["is_running"] is True

        websocket.send_json({"type": "pause"})
        pause_state = websocket.receive_json()
        assert pause_state["is_running"] is False


def test_websocket_set_speed_command():
    """8: SET_SPEED updates simulation playback speed."""
    client = TestClient(app)
    with client.websocket_connect("/ws/simulation") as websocket:
        _ = websocket.receive_json()

        websocket.send_json({"type": "set_speed", "speed": 5})
        speed_state = websocket.receive_json()
        assert speed_state["speed"] == 5.0


def test_websocket_invalid_command_handled_safely():
    """9: Invalid commands do not crash connection."""
    client = TestClient(app)
    with client.websocket_connect("/ws/simulation") as websocket:
        _ = websocket.receive_json()

        # Send unknown command type
        websocket.send_json({"type": "UNKNOWN_ACTION_XYZ"})
        _ = websocket.receive_json()  # State sent after command handling

        # Send valid command after to verify connection is intact
        websocket.send_json({"type": "ignite", "row": 2, "col": 2})
        state = websocket.receive_json()
        assert state["grid"][2][2] == "burning"
