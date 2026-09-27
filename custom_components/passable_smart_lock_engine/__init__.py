"""Passable Smart Lock Engine integration."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from .const import (
    CONF_IMPORT_HELPERS,
    DOMAIN,
    FRONTEND_URL_PATH,
    PLATFORMS,
    SERVICE_CLEAR_CODE,
    SERVICE_DISABLE_CODE,
    SERVICE_ENABLE_CODE,
    SERVICE_GENERATE_PIN,
    SERVICE_GET_USER_INFO,
    SERVICE_IMPORT_HELPERS,
    SERVICE_MANAGE_LOCK_CODES,
    SERVICE_SET_CODE,
    SERVICE_SYNC_LOCKS,
)
from .engine import PassableLockEngine
from .websocket import async_register_websocket_api

_LOGGER = logging.getLogger(__name__)


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Register static frontend paths and Lovelace card resource."""
    if hass.data.setdefault(DOMAIN, {}).get("frontend_registered"):
        return

    card_path = Path(__file__).parent / "frontend" / "passable-lock-manager-card.js"
    if not card_path.is_file():
        _LOGGER.warning("Passable Lock Manager Card file not found at %s", card_path)
        return

    try:
        from homeassistant.components.http import StaticPathConfig

        await hass.http.async_register_static_paths(
            [StaticPathConfig(FRONTEND_URL_PATH, str(card_path), cache_headers=False)]
        )
        hass.data[DOMAIN]["frontend_registered"] = True
        _LOGGER.info("Passable Lock Manager Card registered at %s", FRONTEND_URL_PATH)
    except Exception as err:
        _LOGGER.debug(
            "Static path registration exception (falling back to legacy): %s", err
        )
        try:
            hass.http.register_static_path(
                FRONTEND_URL_PATH, str(card_path), cache_headers=False
            )
            hass.data[DOMAIN]["frontend_registered"] = True
            _LOGGER.info(
                "Passable Lock Manager Card registered at %s (legacy)", FRONTEND_URL_PATH
            )
        except Exception as legacy_err:
            _LOGGER.error("Failed to register static path: %s", legacy_err)

    # Automatically register the Lovelace card resource if available
    hass.async_create_task(_async_register_lovelace_resource(hass))


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the Passable Smart Lock Engine component."""
    await _async_register_frontend(hass)
    return True


async def _async_register_lovelace_resource(hass: HomeAssistant) -> None:
    """Register the card as a Lovelace resource so users don't have to add it manually."""
    try:
        lovelace = hass.data.get("lovelace")
        if not lovelace:
            return

        resources = getattr(lovelace, "resources", None)
        if not resources:
            return

        # Ensure resources are loaded
        if not resources.loaded:
            await resources.async_load()

        # Check if already registered
        for item in resources.async_items():
            if item.get("url") == FRONTEND_URL_PATH:
                return

        # Register resource
        await resources.async_create_item(
            {"res_type": "module", "url": FRONTEND_URL_PATH}
        )
        _LOGGER.info("Registered Lovelace resource: %s", FRONTEND_URL_PATH)
    except Exception as err:
        _LOGGER.debug("Could not auto-register Lovelace resource: %s", err)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Passable Smart Lock Engine from a config entry."""
    await _async_register_frontend(hass)

    engine = PassableLockEngine(hass, entry)
    await engine.async_setup()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = engine

    # Check if user requested helper import during initial setup
    if entry.data.get(CONF_IMPORT_HELPERS, False):
        hass.async_create_task(engine.async_import_from_yaml_helpers())

    # Register WebSocket API
    async_register_websocket_api(hass, engine)

    # Register services
    _async_register_services(hass, engine)

    # Forward setup to platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Listen for options changes
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


def _async_register_services(hass: HomeAssistant, engine: PassableLockEngine) -> None:
    """Register custom integration services."""

    async def handle_set_code(call: ServiceCall) -> None:
        slot = call.data["code_slot"]
        pin = call.data["pin"]
        name = call.data.get("name")
        enabled = call.data.get("enabled", True)
        guest_mode = call.data.get("guest_mode", False)
        duration = call.data.get("duration")
        duration_unit = call.data.get("duration_unit", "hours")
        timer_action = call.data.get("timer_action")
        schedule_enabled = call.data.get("schedule_enabled")
        schedule_days = call.data.get("schedule_days")
        schedule_start = call.data.get("schedule_start")
        schedule_end = call.data.get("schedule_end")
        is_timed = call.data.get("is_timed", False)

        await engine.async_set_code(
            slot=int(slot),
            pin=pin,
            name=name,
            enabled=enabled,
            guest_mode=guest_mode,
            duration=duration,
            duration_unit=duration_unit,
            timer_action=timer_action,
            schedule_enabled=schedule_enabled,
            schedule_days=schedule_days,
            schedule_start=schedule_start,
            schedule_end=schedule_end,
            is_timed=is_timed,
        )

    async def handle_clear_code(call: ServiceCall) -> None:
        slot = int(call.data["code_slot"])
        await engine.async_clear_code(slot)

    async def handle_enable_code(call: ServiceCall) -> None:
        slot = int(call.data["code_slot"])
        await engine.async_enable_code(slot)

    async def handle_disable_code(call: ServiceCall) -> None:
        slot = int(call.data["code_slot"])
        await engine.async_disable_code(slot)

    async def handle_sync_locks(call: ServiceCall) -> None:
        await engine.async_sync_all_locks()

    async def handle_generate_pin(call: ServiceCall) -> dict[str, Any]:
        length = call.data.get("length", 6)
        pin = engine.generate_random_pin(length=length)
        return {"pin": pin}

    async def handle_import_helpers(call: ServiceCall) -> dict[str, Any]:
        count = await engine.async_import_from_yaml_helpers()
        return {"imported_count": count}

    async def handle_get_user_info(call: ServiceCall) -> dict[str, Any]:
        alarm_type = call.data.get("alarm_type")
        alarm_level = call.data.get("alarm_level")
        return engine.get_lock_user_info(alarm_type, alarm_level)

    async def handle_manage_lock_codes(call: ServiceCall) -> None:
        """Backwards compatibility wrapper for script.manage_lock_codes."""
        slot = int(call.data["code_slot"])
        action = call.data["action"].lower()

        if action == "set":
            slot_data = engine.storage.get_slot(slot)
            await engine.async_set_code(slot, slot_data.get("pin", ""))
        elif action == "clear":
            await engine.async_clear_code(slot)
        elif action == "enable":
            await engine.async_enable_code(slot)
        elif action == "disable":
            await engine.async_disable_code(slot)
        elif action == "set_timed":
            slot_data = engine.storage.get_slot(slot)
            await engine.async_set_code(
                slot,
                slot_data.get("pin", ""),
                duration=slot_data.get("duration", 1),
                timer_action=slot_data.get("timer_action", "Clear Code"),
                is_timed=True,
            )
        elif action == "sync":
            await engine.async_sync_all_locks()

    hass.services.async_register(
        DOMAIN, SERVICE_SET_CODE, handle_set_code
    )
    hass.services.async_register(
        DOMAIN, SERVICE_CLEAR_CODE, handle_clear_code
    )
    hass.services.async_register(
        DOMAIN, SERVICE_ENABLE_CODE, handle_enable_code
    )
    hass.services.async_register(
        DOMAIN, SERVICE_DISABLE_CODE, handle_disable_code
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SYNC_LOCKS, handle_sync_locks
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GENERATE_PIN,
        handle_generate_pin,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_IMPORT_HELPERS,
        handle_import_helpers,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_USER_INFO,
        handle_get_user_info,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN, SERVICE_MANAGE_LOCK_CODES, handle_manage_lock_codes
    )


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        engine: PassableLockEngine = hass.data[DOMAIN].pop(entry.entry_id)
        await engine.async_unload()

    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry when options update."""
    await hass.config_entries.async_reload(entry.entry_id)
