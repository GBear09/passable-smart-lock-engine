"""Storage manager for Passable Smart Lock Engine."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    DAYS_OF_WEEK,
    DEFAULT_SLOTS_COUNT,
    STORAGE_KEY,
    STORAGE_VERSION,
    TIMER_ACTION_CLEAR,
)

_LOGGER = logging.getLogger(__name__)


def get_default_slot_data(slot: int) -> dict[str, Any]:
    """Return default empty configuration for a slot."""
    return {
        "slot": slot,
        "name": "",
        "pin": "",
        "enabled": False,
        "guest_mode": False,
        "duration": 1,
        "duration_unit": "hours",
        "timer_action": TIMER_ACTION_CLEAR,
        "timer_expires_at": None,
        "schedule_enabled": False,
        "schedule_days": list(DAYS_OF_WEEK),
        "schedule_start": "00:00:00",
        "schedule_end": "23:59:59",
        "notify_on_active": False,
    }


class PassableLockStorage:
    """Manages persistent atomic storage for locks, slots, and schedules."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize storage."""
        self.hass = hass
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.data: dict[str, Any] = {
            "slots": {},
            "locks": [],
            "biometrics": {},
            "settings": {"slots_count": DEFAULT_SLOTS_COUNT},
        }

    async def async_load(self) -> dict[str, Any]:
        """Load stored data."""
        stored = await self._store.async_load()
        if stored:
            self.data = stored
        else:
            # Initialize with default slots
            slots_count = int(float(self.data["settings"].get("slots_count", DEFAULT_SLOTS_COUNT)))
            self.data["slots"] = {
                str(i): get_default_slot_data(i) for i in range(1, slots_count + 1)
            }
            await self.async_save()

        # Ensure all expected keys exist
        if "slots" not in self.data:
            self.data["slots"] = {}
        if "locks" not in self.data:
            self.data["locks"] = []
        if "biometrics" not in self.data:
            self.data["biometrics"] = {}
        if "settings" not in self.data:
            self.data["settings"] = {"slots_count": DEFAULT_SLOTS_COUNT}

        # Clean up legacy default names like "Slot 9" if no PIN is set
        for s_id, s_data in self.data.get("slots", {}).items():
            if s_data.get("name") == f"Slot {s_id}" and not s_data.get("pin"):
                s_data["name"] = ""
            if "duration_unit" not in s_data:
                s_data["duration_unit"] = "hours"
            if "notify_on_active" not in s_data:
                s_data["notify_on_active"] = False

        return self.data

    async def async_save(self) -> None:
        """Save data to storage."""
        await self._store.async_save(self.data)

    def get_slot(self, slot_id: int | str) -> dict[str, Any]:
        """Get slot data by slot number."""
        slot_key = str(slot_id)
        if slot_key not in self.data["slots"]:
            self.data["slots"][slot_key] = get_default_slot_data(int(slot_key))
        return self.data["slots"][slot_key]

    async def async_update_slot(self, slot_id: int | str, updates: dict[str, Any]) -> dict[str, Any]:
        """Update slot data and persist."""
        slot_key = str(slot_id)
        if slot_key not in self.data["slots"]:
            self.data["slots"][slot_key] = get_default_slot_data(int(slot_key))
        self.data["slots"][slot_key].update(updates)
        await self.async_save()
        return self.data["slots"][slot_key]

    async def async_clear_slot(self, slot_id: int | str) -> dict[str, Any]:
        """Reset slot data to defaults."""
        slot_key = str(slot_id)
        self.data["slots"][slot_key] = get_default_slot_data(int(slot_key))
        await self.async_save()
        return self.data["slots"][slot_key]

    async def async_set_slots_count(self, count: int | float) -> None:
        """Adjust total managed slots count."""
        count_int = int(float(count))
        self.data["settings"]["slots_count"] = count_int
        for i in range(1, count_int + 1):
            s_key = str(i)
            if s_key not in self.data["slots"]:
                self.data["slots"][s_key] = get_default_slot_data(i)
        await self.async_save()

    async def async_set_locks(self, locks: list[str]) -> None:
        """Set configured locks."""
        self.data["locks"] = locks
        await self.async_save()

    async def async_set_biometrics(self, biometrics: dict[str, str]) -> None:
        """Set biometric slot mappings."""
        self.data["biometrics"] = biometrics
        await self.async_save()
