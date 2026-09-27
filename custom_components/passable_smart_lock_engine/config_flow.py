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
    CONF_BIOMETRIC_SLOTS_COUNT,
    CONF_IMPORT_HELPERS,
    CONF_LOCKS,
    CONF_SLOTS_COUNT,
    DEFAULT_BIOMETRIC_SLOTS_COUNT,
    DEFAULT_SLOTS_COUNT,
    DOMAIN,
    MAX_BIOMETRIC_SLOTS_COUNT,
    MAX_SLOTS_COUNT,
    MIN_BIOMETRIC_SLOTS_COUNT,
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
            if CONF_SLOTS_COUNT in user_input:
                try:
                    user_input[CONF_SLOTS_COUNT] = int(float(user_input[CONF_SLOTS_COUNT]))
                except (ValueError, TypeError):
                    user_input[CONF_SLOTS_COUNT] = DEFAULT_SLOTS_COUNT

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
        super().__init__()
        self._config_entry = config_entry

    @property
    def config_entry(self) -> config_entries.ConfigEntry:
        """Return the config entry."""
        return self._config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage options: adjust locks, slot counts, and biometric names."""
        if user_input is not None:
            raw_slots = user_input.get(CONF_SLOTS_COUNT, DEFAULT_SLOTS_COUNT)
            try:
                slots_int = int(float(raw_slots))
            except (ValueError, TypeError):
                slots_int = DEFAULT_SLOTS_COUNT

            raw_bio_count = user_input.get(
                CONF_BIOMETRIC_SLOTS_COUNT, DEFAULT_BIOMETRIC_SLOTS_COUNT
            )
            try:
                bio_count_int = int(float(raw_bio_count))
            except (ValueError, TypeError):
                bio_count_int = DEFAULT_BIOMETRIC_SLOTS_COUNT

            # Extract biometric slot names up to MAX_BIOMETRIC_SLOTS_COUNT
            biometrics = {}
            for i in range(1, MAX_BIOMETRIC_SLOTS_COUNT + 1):
                key = f"biometric_slot_{i}_name"
                if key in user_input and user_input[key]:
                    biometrics[str(i)] = str(user_input[key]).strip()

            options_data = {
                CONF_LOCKS: user_input.get(CONF_LOCKS, []),
                CONF_SLOTS_COUNT: slots_int,
                CONF_BIOMETRIC_SLOTS_COUNT: bio_count_int,
                CONF_BIOMETRIC_MAPPINGS: biometrics,
            }

            return self.async_create_entry(title="", data=options_data)

        current_locks = list(self.config_entry.options.get(
            CONF_LOCKS, self.config_entry.data.get(CONF_LOCKS, [])
        ))
        try:
            current_slots = int(float(self.config_entry.options.get(
                CONF_SLOTS_COUNT,
                self.config_entry.data.get(CONF_SLOTS_COUNT, DEFAULT_SLOTS_COUNT),
            )))
        except (ValueError, TypeError):
            current_slots = DEFAULT_SLOTS_COUNT

        current_biometrics = dict(self.config_entry.options.get(
            CONF_BIOMETRIC_MAPPINGS,
            self.config_entry.data.get(CONF_BIOMETRIC_MAPPINGS, {}),
        ))

        try:
            current_bio_count = int(float(self.config_entry.options.get(
                CONF_BIOMETRIC_SLOTS_COUNT,
                self.config_entry.data.get(
                    CONF_BIOMETRIC_SLOTS_COUNT, DEFAULT_BIOMETRIC_SLOTS_COUNT
                ),
            )))
        except (ValueError, TypeError):
            current_bio_count = DEFAULT_BIOMETRIC_SLOTS_COUNT

        # Ensure current_bio_count is at least as large as any existing named slot
        if current_biometrics:
            numeric_keys = [int(k) for k in current_biometrics.keys() if k.isdigit()]
            if numeric_keys:
                current_bio_count = max(current_bio_count, max(numeric_keys))

        schema_dict: dict[Any, Any] = {
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
            vol.Required(
                CONF_BIOMETRIC_SLOTS_COUNT, default=current_bio_count
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(
                    min=MIN_BIOMETRIC_SLOTS_COUNT,
                    max=MAX_BIOMETRIC_SLOTS_COUNT,
                    mode=selector.NumberSelectorMode.BOX,
                )
            ),
        }

        for i in range(1, current_bio_count + 1):
            schema_dict[
                vol.Optional(
                    f"biometric_slot_{i}_name",
                    description={"suggested_value": current_biometrics.get(str(i), "")},
                    default=current_biometrics.get(str(i), ""),
                )
            ] = selector.TextSelector()

        schema = vol.Schema(schema_dict)

        return self.async_show_form(step_id="init", data_schema=schema)
