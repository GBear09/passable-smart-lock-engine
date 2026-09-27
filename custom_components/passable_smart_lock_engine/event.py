"""Event platform for Passable Smart Lock Engine."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.event import EventEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME
from .engine import PassableLockEngine, SIGNAL_ACTIVITY_UPDATED

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the event entities."""
    engine: PassableLockEngine = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([PassableLockAccessEvent(engine)])


class PassableLockAccessEvent(EventEntity):
    """Event entity for lock unlock occurrences."""

    _attr_has_entity_name = True
    _attr_name = "Lock Access Event"
    _attr_icon = "mdi:key-wireless"
    _attr_event_types = ["keypad", "biometric"]

    def __init__(self, engine: PassableLockEngine) -> None:
        """Initialize the event entity."""
        self.engine = engine
        self._attr_unique_id = f"{DOMAIN}_access_event"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "hub")},
            name=NAME,
            manufacturer="GBear09",
            model="Smart Lock Engine Hub",
        )

    async def async_added_to_hass(self) -> None:
        """Register dispatcher callback."""
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_ACTIVITY_UPDATED, self._handle_activity_updated
            )
        )

    @callback
    def _handle_activity_updated(self) -> None:
        """Trigger event when new unlock occurs."""
        activity = self.engine.last_activity
        method = activity.get("method", "keypad").lower()
        event_type = "biometric" if "biometric" in method else "keypad"
        self._trigger_event(event_type, activity)
        self.schedule_update_ha_state()
