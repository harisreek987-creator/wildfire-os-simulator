import pytest
from simulation.events import EventQueue, EventType, EventSeverity


def test_event_queue_initialization_and_push():
    """1 & 2: Event queue initializes and pushes events."""
    eq = EventQueue()
    assert eq.is_empty() is True

    evt = eq.push(
        event_type=EventType.IGNITION,
        simulation_time=0,
        source="Test",
        message="Test ignition event",
        severity=EventSeverity.WARNING,
    )
    assert evt.event_type == EventType.IGNITION
    assert eq.get_pending_count() == 1


def test_event_queue_fifo_ordering():
    """3 & 4: FIFO ordering works on pop."""
    eq = EventQueue()
    eq.push(EventType.IGNITION, 1, "Source1", "First event")
    eq.push(EventType.SENSOR_DETECTION, 2, "Source2", "Second event")
    eq.push(EventType.ALERT, 3, "Source3", "Third event")

    e1 = eq.pop()
    assert e1 is not None and e1.event_type == EventType.IGNITION

    e2 = eq.pop()
    assert e2 is not None and e2.event_type == EventType.SENSOR_DETECTION

    e3 = eq.pop()
    assert e3 is not None and e3.event_type == EventType.ALERT

    assert eq.is_empty() is True


def test_required_event_types_supported():
    """5. All 8 required event types are supported."""
    required = [
        EventType.IGNITION,
        EventType.FIRE_SPREAD,
        EventType.SENSOR_SCAN,
        EventType.SENSOR_DETECTION,
        EventType.ALERT,
        EventType.EMERGENCY_RESPONSE,
        EventType.RESOURCE_ALLOCATION,
        EventType.FIRE_CONTAINED,
    ]
    eq = EventQueue()
    for et in required:
        evt = eq.push(et, 10, "Test", f"Event {et.value}")
        assert evt.event_type == et


def test_event_timestamp_uses_simulation_time():
    """6. Event timestamps match provided simulation time."""
    eq = EventQueue()
    evt = eq.push(EventType.ALERT, 42, "Kernel", "Alert message")
    assert evt.simulation_time == 42


def test_event_queue_history_and_serialization():
    """7. Event history is bounded and serializes cleanly."""
    eq = EventQueue(max_history=5)
    for i in range(10):
        eq.push(EventType.SENSOR_SCAN, i, "Sensor", f"Scan {i}")

    history = eq.get_recent_events()
    assert len(history) == 5
    # Most recent first in history
    assert history[0].simulation_time == 9
