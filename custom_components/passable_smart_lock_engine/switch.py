"""Switch platform for Passable Smart Lock Engine code slots."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME
from .engine import PassableLockEngine, SIGNAL_SLOT_UPDATED

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the slot switch entities and migrate entity IDs if necessary."""
    engine: PassableLockEngine = hass.data[DOMAIN][entry.entry_id]

    ent_reg = er.async_get(hass)
    for slot_num in range(1, int(engine.slots_count) + 1):
        unique_id = f"{DOMAIN}_slot_{slot_num}_enabled"
        current_entity_id = ent_reg.async_get_entity_id("switch", DOMAIN, unique_id)
        target_entity_id = f"switch.passable_smart_lock_engine_slot_{slot_num}"
        if current_entity_id and current_entity_id != target_entity_id:
            existing = ent_reg.async_get(target_entity_id)
            if existing and existing.unique_id != unique_id:
                ent_reg.async_remove(target_entity_id)
            _LOGGER.info(
                "Migrating switch entity ID from %s to %s",
                current_entity_id,
                target_entity_id,
            )
            ent_reg.async_update_entity(
                current_entity_id,
                new_entity_id=target_entity_id,
                original_name=f"Slot {slot_num}",
            )

    switches = [
        PassableLockSlotSwitch(engine, slot_num)
        for slot_num in range(1, int(engine.slots_count) + 1)
    ]
    async_add_entities(switches)


class PassableLockSlotSwitch(SwitchEntity):
    """Switch entity to enable or disable an individual lock code slot."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:lock-check"

    def __init__(self, engine: PassableLockEngine, slot: int) -> None:
        """Initialize the switch."""
        self.engine = engine
        self.slot = slot
        self._attr_unique_id = f"{DOMAIN}_slot_{slot}_enabled"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "hub")},
            name=NAME,
            manufacturer="GBear09",
            model="Smart Lock Engine Hub",
        )

    @property
    def name(self) -> str:
        """Return slot switch name."""
        return f"Slot {self.slot}"

    @property
    def is_on(self) -> bool:
        """Return True if the slot code is currently enabled."""
        slot_data = self.engine.storage.get_slot(self.slot)
        return slot_data.get("enabled", False)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return slot attributes (excluding plain-text PIN for security)."""
        slot_data = self.engine.storage.get_slot(self.slot)
        return {
            "slot": self.slot,
            "code_name": slot_data.get("name", ""),
            "guest_mode": slot_data.get("guest_mode", False),
            "schedule_enabled": slot_data.get("schedule_enabled", False),
            "schedule_recurrence": slot_data.get("schedule_recurrence", "weekly"),
            "schedule_anchor_date": slot_data.get("schedule_anchor_date"),
            "notify_on_active": slot_data.get("notify_on_active", False),
            "timer_active": slot_data.get("timer_expires_at") is not None,
            "timer_expires_at": slot_data.get("timer_expires_at"),
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn on the slot code."""
        await self.engine.async_enable_code(self.slot, update_hardware=True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn off the slot code."""
        await self.engine.async_disable_code(self.slot, update_hardware=True)

    async def async_added_to_hass(self) -> None:
        """Register dispatcher callback when slot updates."""
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_SLOT_UPDATED, self._handle_slot_update
            )
        )

    @callback
    def _handle_slot_update(self, updated_slot: int) -> None:
        """Update entity state if this slot or all slots were modified."""
        if updated_slot in (0, self.slot):
            self.schedule_update_ha_state()
