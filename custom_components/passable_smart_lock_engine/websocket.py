"""WebSocket API endpoints for Passable Smart Lock Engine."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
import voluptuous as vol

from .const import DOMAIN
from .engine import PassableLockEngine

_LOGGER = logging.getLogger(__name__)


@callback
def async_register_websocket_api(hass: HomeAssistant, engine: PassableLockEngine) -> None:
    """Register WebSocket API commands."""

    @websocket_api.websocket_command(
        {
            vol.Required("type"): f"{DOMAIN}/get_data",
            vol.Optional("reveal_pins", default=False): bool,
        }
    )
    @websocket_api.async_response
    async def ws_get_data(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Handle request for all slots and lock configuration."""
        reveal_pins = msg.get("reveal_pins", False) and connection.user is not None

        slots_dict = engine.storage.data.get("slots", {})
        processed_slots = {}

        for slot_id, slot_data in slots_dict.items():
            slot_copy = dict(slot_data)
            # Mask PIN unless authenticated user explicitly requests it
            if not reveal_pins and slot_copy.get("pin"):
                slot_copy["pin"] = "••••"
            processed_slots[slot_id] = slot_copy

        connection.send_result(
            msg["id"],
            {
                "slots": processed_slots,
                "locks": engine.locks,
                "biometrics": engine.biometric_mappings,
                "slots_count": engine.slots_count,
                "last_activity": engine.last_activity,
            },
        )

    @websocket_api.websocket_command(
        {
            vol.Required("type"): f"{DOMAIN}/save_slot",
            vol.Required("slot"): vol.Coerce(int),
            vol.Required("pin"): str,
            vol.Optional("name"): str,
            vol.Optional("enabled", default=True): bool,
            vol.Optional("guest_mode", default=False): bool,
            vol.Optional("duration"): vol.Coerce(int),
            vol.Optional("timer_action"): str,
            vol.Optional("schedule_enabled"): bool,
            vol.Optional("schedule_days"): [str],
            vol.Optional("schedule_start"): str,
            vol.Optional("schedule_end"): str,
            vol.Optional("is_timed", default=False): bool,
        }
    )
    @websocket_api.async_response
    async def ws_save_slot(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Handle updating or setting a code slot."""
        slot = msg["slot"]
        await engine.async_set_code(
            slot=slot,
            pin=msg["pin"],
            name=msg.get("name"),
            enabled=msg.get("enabled", True),
            guest_mode=msg.get("guest_mode", False),
            duration=msg.get("duration"),
            timer_action=msg.get("timer_action"),
            schedule_enabled=msg.get("schedule_enabled"),
            schedule_days=msg.get("schedule_days"),
            schedule_start=msg.get("schedule_start"),
            schedule_end=msg.get("schedule_end"),
            is_timed=msg.get("is_timed", False),
        )
        connection.send_result(msg["id"], {"success": True, "slot": slot})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): f"{DOMAIN}/clear_slot",
            vol.Required("slot"): vol.Coerce(int),
        }
    )
    @websocket_api.async_response
    async def ws_clear_slot(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Handle clearing a code slot."""
        slot = msg["slot"]
        await engine.async_clear_code(slot)
        connection.send_result(msg["id"], {"success": True, "slot": slot})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): f"{DOMAIN}/toggle_slot",
            vol.Required("slot"): vol.Coerce(int),
            vol.Required("enabled"): bool,
        }
    )
    @websocket_api.async_response
    async def ws_toggle_slot(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Handle enabling or disabling a code slot."""
        slot = msg["slot"]
        enabled = msg["enabled"]
        if enabled:
            await engine.async_enable_code(slot)
        else:
            await engine.async_disable_code(slot)
        connection.send_result(msg["id"], {"success": True, "slot": slot, "enabled": enabled})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): f"{DOMAIN}/sync_locks",
        }
    )
    @websocket_api.async_response
    async def ws_sync_locks(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Trigger full sync of all active codes across all locks."""
        hass.async_create_task(engine.async_sync_all_locks())
        connection.send_result(msg["id"], {"success": True})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): f"{DOMAIN}/import_helpers",
        }
    )
    @websocket_api.async_response
    @websocket_api.require_admin
    async def ws_import_helpers(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Trigger import of existing YAML helper entity data."""
        count = await engine.async_import_from_yaml_helpers()
        connection.send_result(msg["id"], {"success": True, "imported_count": count})

    websocket_api.async_register_command(hass, ws_get_data)
    websocket_api.async_register_command(hass, ws_save_slot)
    websocket_api.async_register_command(hass, ws_clear_slot)
    websocket_api.async_register_command(hass, ws_toggle_slot)
    websocket_api.async_register_command(hass, ws_sync_locks)
    websocket_api.async_register_command(hass, ws_import_helpers)
