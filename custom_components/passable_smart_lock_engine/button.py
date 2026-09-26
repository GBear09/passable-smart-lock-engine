"""Button platform for Passable Smart Lock Engine."""

from __future__ import annotations

import logging

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME
from .engine import PassableLockEngine

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the button entities."""
    engine: PassableLockEngine = hass.data[DOMAIN][entry.entry_id]

    buttons = [
        PassableSyncButton(engine),
        PassableImportButton(engine),
    ]
    async_add_entities(buttons)


class PassableSyncButton(ButtonEntity):
    """Button to manually synchronize all active codes to physical locks."""

    _attr_has_entity_name = True
    _attr_name = "Sync All Lock Codes"
    _attr_icon = "mdi:sync"

    def __init__(self, engine: PassableLockEngine) -> None:
        """Initialize the button."""
        self.engine = engine
        self._attr_unique_id = f"{DOMAIN}_sync_all_locks"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "hub")},
            name=NAME,
            manufacturer="GBear09",
            model="Smart Lock Engine Hub",
        )

    async def async_press(self) -> None:
        """Press the button to trigger code sync."""
        await self.engine.async_sync_all_locks()


class PassableImportButton(ButtonEntity):
    """Button to import existing YAML package helper states into storage."""

    _attr_has_entity_name = True
    _attr_name = "Import YAML Helpers"
    _attr_icon = "mdi:database-import"

    def __init__(self, engine: PassableLockEngine) -> None:
        """Initialize the button."""
        self.engine = engine
        self._attr_unique_id = f"{DOMAIN}_import_yaml_helpers"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "hub")},
            name=NAME,
            manufacturer="GBear09",
            model="Smart Lock Engine Hub",
        )

    async def async_press(self) -> None:
        """Press the button to import YAML helpers."""
        await self.engine.async_import_from_yaml_helpers()
