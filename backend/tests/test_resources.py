import pytest
from simulation.resources import ResourceManager


def test_resources_initialization():
    """1. Resources initialize with correct capacity and zero allocated."""
    rm = ResourceManager()
    resources = rm.get_all_resources()
    assert len(resources) == 3

    ff = rm.get_resource("Firefighters")
    water = rm.get_resource("Water Supply")
    drones = rm.get_resource("Surveillance Drones")

    assert ff is not None and ff.total == 20 and ff.available == 20 and ff.in_use == 0
    assert water is not None and water.total == 100 and water.available == 100
    assert drones is not None and drones.total == 4 and drones.available == 4


def test_resource_allocation_decreases_available_increases_in_use():
    """2. Allocation modifies available and in_use amounts."""
    rm = ResourceManager()
    success = rm.allocate("Firefighters", 6)
    assert success is True

    ff = rm.get_resource("Firefighters")
    assert ff.available == 14
    assert ff.in_use == 6


def test_resource_allocation_fails_safely_when_insufficient():
    """3 & 4: Resource allocation fails when requested exceeds available."""
    rm = ResourceManager()
    # Drones total is 4
    success = rm.allocate("Surveillance Drones", 5)
    assert success is False

    drones = rm.get_resource("Surveillance Drones")
    assert drones.available == 4
    assert drones.in_use == 0


def test_resource_release():
    """5. Releasing allocated resources restores available amount."""
    rm = ResourceManager()
    rm.allocate("Water Supply", 30)
    rm.release("Water Supply", 20)

    water = rm.get_resource("Water Supply")
    assert water.in_use == 10
    assert water.available == 90

    rm.release_all()
    assert water.in_use == 0
    assert water.available == 100


def test_resource_reset():
    """6. Reset restores initial resource state."""
    rm = ResourceManager()
    rm.allocate("Firefighters", 10)
    rm.reset()

    ff = rm.get_resource("Firefighters")
    assert ff.available == 20
    assert ff.in_use == 0
