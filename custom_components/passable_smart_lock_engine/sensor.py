"""Sensor platform for Passable Smart Lock Engine."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME
from .engine import (
    PassableLockEngine,
    SIGNAL_ACTIVITY_UPDATED,
    SIGNAL_SLOT_UPDATED,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the sensor entities."""
    engine: PassableLockEngine = hass.data[DOMAIN][entry.entry_id]

    sensors = [
        PassableActiveSlotsSensor(engine),
        PassableLastActivitySensor(engine),
    ]
    async_add_entities(sensors)


class PassableActiveSlotsSensor(SensorEntity):
    """Sensor that counts currently enabled lock code slots."""

    _attr_has_entity_name = True
    _attr_name = "Active Lock Slots"
    _attr_icon = "mdi:counter"

    def __init__(self, engine: PassableLockEngine) -> None:
        """Initialize the sensor."""
        self.engine = engine
        self._attr_unique_id = f"{DOMAIN}_active_slots_count"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "hub")},
            name=NAME,
            manufacturer="GBear09",
            model="Smart Lock Engine Hub",
        )

    @property
    def native_value(self) -> int:
        """Return the count of enabled slots with valid PINs."""
        slots = self.engine.storage.data.get("slots", {})
        return sum(
            1 for s in slots.values() if s.get("enabled", False) and s.get("pin")
        )

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        return {
            "total_slots": self.engine.slots_count,
            "managed_locks": self.engine.locks,
        }

    async def async_added_to_hass(self) -> None:
        """Register dispatcher callback."""
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_SLOT_UPDATED, lambda _: self.async_write_ha_state()
            )
        )


class PassableLastActivitySensor(SensorEntity):
    """Sensor that tracks the last door unlock actor and details."""

    _attr_has_entity_name = True
    _attr_name = "Last Entry Action"
    _attr_icon = "mdi:door-open"

    def __init__(self, engine: PassableLockEngine) -> None:
        """Initialize the sensor."""
        self.engine = engine
        self._attr_unique_id = f"{DOMAIN}_last_entry_action"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "hub")},
            name=NAME,
            manufacturer="GBear09",
            model="Smart Lock Engine Hub",
        )

    @property
    def native_value(self) -> str:
        """Return human-readable last access string."""
        act = self.engine.last_activity
        if act.get("actor") and act["actor"] != "None":
            return f"{act['door']} unlocked by {act['actor']}"
        return "Idle"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return raw attributes for automations."""
        return self.engine.last_activity

    async def async_added_to_hass(self) -> None:
        """Register dispatcher callback."""
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                SIGNAL_ACTIVITY_UPDATED,
                lambda: self.async_write_ha_state(),
            )
        )
