"""Config flow and Options flow for Passable Smart Lock Engine."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector
import voluptuous as vol

from .const import (
    CONF_BIOMETRIC_MAPPINGS,
    CONF_IMPORT_HELPERS,
    CONF_LOCKS,
    CONF_SLOTS_COUNT,
    DEFAULT_SLOTS_COUNT,
    DOMAIN,
    MAX_SLOTS_COUNT,
    MIN_SLOTS_COUNT,
    NAME,
)

_LOGGER = logging.getLogger(__name__)


class PassableLockConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Passable Smart Lock Engine."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial setup step."""
        errors: dict[str, str] = {}

        # Allow only one instance of the engine
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            locks = user_input.get(CONF_LOCKS, [])
            if not locks:
                errors["base"] = "no_locks_selected"
            else:
                return self.async_create_entry(
                    title=NAME,
                    data=user_input,
                )

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_LOCKS, default=[]
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="lock", multiple=True)
                ),
                vol.Required(
                    CONF_SLOTS_COUNT, default=DEFAULT_SLOTS_COUNT
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=MIN_SLOTS_COUNT,
                        max=MAX_SLOTS_COUNT,
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_IMPORT_HELPERS, default=True
                ): selector.BooleanSelector(),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Get options flow handler."""
        return PassableLockOptionsFlowHandler(config_entry)


class PassableLockOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for Passable Smart Lock Engine."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage options: adjust locks, slot counts, and biometric names."""
        if user_input is not None:
            # Extract biometric slot names
            biometrics = {}
            for i in range(1, 5):
                key = f"biometric_slot_{i}_name"
                if key in user_input and user_input[key]:
                    biometrics[str(i)] = user_input[key]

            options_data = {
                CONF_LOCKS: user_input.get(CONF_LOCKS, []),
                CONF_SLOTS_COUNT: user_input.get(CONF_SLOTS_COUNT, DEFAULT_SLOTS_COUNT),
                CONF_BIOMETRIC_MAPPINGS: biometrics,
            }

            return self.async_create_entry(title="", data=options_data)

        current_locks = self.config_entry.options.get(
            CONF_LOCKS, self.config_entry.data.get(CONF_LOCKS, [])
        )
        current_slots = self.config_entry.options.get(
            CONF_SLOTS_COUNT,
            self.config_entry.data.get(CONF_SLOTS_COUNT, DEFAULT_SLOTS_COUNT),
        )
        current_biometrics = self.config_entry.options.get(
            CONF_BIOMETRIC_MAPPINGS,
            self.config_entry.data.get(CONF_BIOMETRIC_MAPPINGS, {}),
        )

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_LOCKS, default=current_locks
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="lock", multiple=True)
                ),
                vol.Required(
                    CONF_SLOTS_COUNT, default=current_slots
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=MIN_SLOTS_COUNT,
                        max=MAX_SLOTS_COUNT,
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    "biometric_slot_1_name",
                    default=current_biometrics.get("1", ""),
                ): selector.TextSelector(),
                vol.Optional(
                    "biometric_slot_2_name",
                    default=current_biometrics.get("2", ""),
                ): selector.TextSelector(),
                vol.Optional(
                    "biometric_slot_3_name",
                    default=current_biometrics.get("3", ""),
                ): selector.TextSelector(),
                vol.Optional(
                    "biometric_slot_4_name",
                    default=current_biometrics.get("4", ""),
                ): selector.TextSelector(),
            }
        )

        return self.async_show_form(step_id="init", data_schema=schema)
