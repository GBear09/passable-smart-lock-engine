"""Universal lock provider for Passable Smart Lock Engine."""

from __future__ import annotations

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

_LOGGER = logging.getLogger(__name__)


class BaseLockProvider(ABC):
    """Abstract base class for lock hardware providers."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize provider."""
        self.hass = hass

    @abstractmethod
    async def async_set_usercode(
        self, entity_id: str, slot: int, pin: str, name: str | None = None
    ) -> bool:
        """Program a usercode into a lock hardware slot."""

    @abstractmethod
    async def async_clear_usercode(self, entity_id: str, slot: int) -> bool:
        """Clear a usercode from a lock hardware slot."""


class ZWaveJSLockProvider(BaseLockProvider):
    """Lock provider for Z-Wave JS locks (Yale, Schlage, Kwikset, etc.)."""

    async def async_set_usercode(
        self, entity_id: str, slot: int, pin: str, name: str | None = None
    ) -> bool:
        """Set user code via zwave_js service."""
        _LOGGER.debug(
            "Z-Wave JS: Setting usercode for %s at slot %s", entity_id, slot
        )
        try:
            await self.hass.services.async_call(
                "zwave_js",
                "set_lock_usercode",
                {"code_slot": int(slot), "usercode": str(pin)},
                target={"entity_id": entity_id},
                blocking=True,
            )
            return True
        except Exception as err:
            _LOGGER.error(
                "Z-Wave JS failed to set usercode for %s slot %s: %s",
                entity_id,
                slot,
                err,
            )
            return False

    async def async_clear_usercode(self, entity_id: str, slot: int) -> bool:
        """Clear user code via zwave_js service."""
        _LOGGER.debug(
            "Z-Wave JS: Clearing usercode for %s at slot %s", entity_id, slot
        )
        try:
            await self.hass.services.async_call(
                "zwave_js",
                "clear_lock_usercode",
                {"code_slot": int(slot)},
                target={"entity_id": entity_id},
                blocking=True,
            )
            return True
        except Exception as err:
            _LOGGER.error(
                "Z-Wave JS failed to clear usercode for %s slot %s: %s",
                entity_id,
                slot,
                err,
            )
            return False


class GenericLockProvider(BaseLockProvider):
    """Generic fallback provider using core lock or ZHA services."""

    async def async_set_usercode(
        self, entity_id: str, slot: int, pin: str, name: str | None = None
    ) -> bool:
        """Attempt to set usercode using available services."""
        # Try generic lock.set_usercode
        if self.hass.services.has_service("lock", "set_usercode"):
            try:
                await self.hass.services.async_call(
                    "lock",
                    "set_usercode",
                    {"code_slot": int(slot), "usercode": str(pin)},
                    target={"entity_id": entity_id},
                    blocking=True,
                )
                return True
            except Exception as err:
                _LOGGER.warning("lock.set_usercode failed: %s", err)

        # Try ZHA service if available
        if self.hass.services.has_service("zha", "set_lock_user_code"):
            try:
                await self.hass.services.async_call(
                    "zha",
                    "set_lock_user_code",
                    {"code_slot": int(slot), "user_code": str(pin)},
                    target={"entity_id": entity_id},
                    blocking=True,
                )
                return True
            except Exception as err:
                _LOGGER.warning("zha.set_lock_user_code failed: %s", err)

        _LOGGER.error("No suitable service found to set usercode on %s", entity_id)
        return False

    async def async_clear_usercode(self, entity_id: str, slot: int) -> bool:
        """Attempt to clear usercode using available services."""
        if self.hass.services.has_service("lock", "clear_usercode"):
            try:
                await self.hass.services.async_call(
                    "lock",
                    "clear_usercode",
                    {"code_slot": int(slot)},
                    target={"entity_id": entity_id},
                    blocking=True,
                )
                return True
            except Exception as err:
                _LOGGER.warning("lock.clear_usercode failed: %s", err)

        if self.hass.services.has_service("zha", "clear_lock_user_code"):
            try:
                await self.hass.services.async_call(
                    "zha",
                    "clear_lock_user_code",
                    {"code_slot": int(slot)},
                    target={"entity_id": entity_id},
                    blocking=True,
                )
                return True
            except Exception as err:
                _LOGGER.warning("zha.clear_lock_user_code failed: %s", err)

        _LOGGER.error("No suitable service found to clear usercode on %s", entity_id)
        return False


def get_lock_provider(hass: HomeAssistant, entity_id: str) -> BaseLockProvider:
    """Detect platform from entity registry and return optimal provider."""
    registry = er.async_get(hass)
    entry = registry.async_get(entity_id)

    if entry and entry.platform == "zwave_js":
        return ZWaveJSLockProvider(hass)
    if entry and entry.platform == "zha":
        return GenericLockProvider(hass)

    # Check if zwave_js service exists as a smart default
    if hass.services.has_service("zwave_js", "set_lock_usercode"):
        return ZWaveJSLockProvider(hass)

    return GenericLockProvider(hass)
