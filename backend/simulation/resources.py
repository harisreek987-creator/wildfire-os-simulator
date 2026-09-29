from typing import List, Dict, Optional
from pydantic import BaseModel, Field, ConfigDict


class ResourceItem(BaseModel):
    """Simulated physical/OS shared resource item."""
    model_config = ConfigDict(use_enum_values=True)

    id: str = Field(..., description="Unique resource identifier")
    name: str = Field(..., description="Resource name (e.g. Firefighters, Water Supply)")
    total: int = Field(..., ge=0, description="Total resource capacity")
    available: int = Field(..., ge=0, description="Currently available capacity")
    in_use: int = Field(default=0, ge=0, description="Currently allocated capacity")
    unit: str = Field(default="Units", description="Measurement unit (e.g. Units, kL)")
    icon_name: str = Field(default="Box", description="Frontend Lucide icon key")


class ResourceManager:
    """Manages virtual OS shared resources and allocation/preemption mutexes."""

    def __init__(self):
        self._resources: Dict[str, ResourceItem] = {}
        self.initialize_default_resources()

    def initialize_default_resources(self) -> None:
        """Initialize standard emergency response resource limits."""
        self._resources = {
            "Firefighters": ResourceItem(
                id="res-1",
                name="Firefighters",
                total=20,
                available=20,
                in_use=0,
                unit="Units",
                icon_name="Users",
            ),
            "Water Supply": ResourceItem(
                id="res-2",
                name="Water Supply",
                total=100,
                available=100,
                in_use=0,
                unit="kL",
                icon_name="Droplets",
            ),
            "Surveillance Drones": ResourceItem(
                id="res-3",
                name="Surveillance Drones",
                total=4,
                available=4,
                in_use=0,
                unit="Units",
                icon_name="Radio",
            ),
        }

    def allocate(self, resource_name: str, amount: int) -> bool:
        """Allocate resource amount. Returns False if insufficient resources available."""
        if resource_name not in self._resources or amount <= 0:
            return False

        res = self._resources[resource_name]
        if res.available < amount:
            return False

        res.available -= amount
        res.in_use += amount
        return True

    def release(self, resource_name: str, amount: int) -> None:
        """Release allocated resource back to the available pool."""
        if resource_name not in self._resources or amount <= 0:
            return

        res = self._resources[resource_name]
        actual_release = min(amount, res.in_use)
        res.in_use -= actual_release
        res.available = min(res.total, res.available + actual_release)

    def release_all(self) -> None:
        """Release all allocated resources."""
        for res in self._resources.values():
            res.available = res.total
            res.in_use = 0

    def reset(self) -> None:
        """Reset resource manager on simulation reset."""
        self.initialize_default_resources()

    def get_resource(self, resource_name: str) -> Optional[ResourceItem]:
        return self._resources.get(resource_name)

    def get_all_resources(self) -> List[ResourceItem]:
        """Return list of all current resource items."""
        return list(self._resources.values())
