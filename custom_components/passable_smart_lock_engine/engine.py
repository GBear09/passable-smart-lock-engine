"""Core engine for Passable Smart Lock Engine."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
import logging
import random
from typing import Any, Callable

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_track_point_in_time,
    async_track_state_change_event,
    async_track_time_change,
)
import homeassistant.util.dt as dt_util

from .const import (
    ACTION_CLEAR,
    ACTION_DISABLE,
    ACTION_ENABLE,
    ACTION_SET,
    ACTION_SET_TIMED,
    ACTION_SYNC,
    CONF_BIOMETRIC_MAPPINGS,
    CONF_BIOMETRIC_SLOTS_COUNT,
    CONF_LOCKS,
    CONF_SLOTS_COUNT,
    DAYS_OF_WEEK,
    DEFAULT_BIOMETRIC_MAPPINGS,
    DEFAULT_BIOMETRIC_SLOTS_COUNT,
    DEFAULT_SLOTS_COUNT,
    DOMAIN,
    EVENT_LOCK_ACCESS,
    EVENT_SLOT_DISABLED,
    EVENT_SLOT_ENABLED,
    TIMER_ACTION_CLEAR,
    TIMER_ACTION_DISABLE,
)
from .lock_provider import get_lock_provider
from .storage import PassableLockStorage, get_default_slot_data

_LOGGER = logging.getLogger(__name__)

SIGNAL_SLOT_UPDATED = f"{DOMAIN}_slot_updated"
SIGNAL_ACTIVITY_UPDATED = f"{DOMAIN}_activity_updated"


class PassableLockEngine:
    """Smart Lock Engine orchestrator."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the engine."""
        self.hass = hass
        self.entry = entry
        self.storage = PassableLockStorage(hass)
        self._unsub_callbacks: list[CALLBACK_TYPE] = []
        self._timer_unsubs: dict[str, CALLBACK_TYPE] = {}
        self._last_unlock_event: dict[str, Any] = {}
        self.last_activity: dict[str, Any] = {
            "door": "None",
            "actor": "None",
            "method": "None",
            "slot": "None",
            "timestamp": None,
            "is_family": False,
            "is_guest": False,
        }

    @property
    def locks(self) -> list[str]:
        """Return configured lock entity IDs."""
        return self.entry.options.get(
            CONF_LOCKS, self.entry.data.get(CONF_LOCKS, [])
        )

    @property
    def slots_count(self) -> int:
        """Return number of configured slots."""
        raw = self.entry.options.get(
            CONF_SLOTS_COUNT,
            self.entry.data.get(CONF_SLOTS_COUNT, DEFAULT_SLOTS_COUNT),
        )
        try:
            return int(float(raw))
        except (ValueError, TypeError):
            return DEFAULT_SLOTS_COUNT

    @property
    def biometric_mappings(self) -> dict[str, str]:
        """Return biometric slot mappings (slot -> name)."""
        mappings = self.entry.options.get(
            CONF_BIOMETRIC_MAPPINGS,
            self.entry.data.get(CONF_BIOMETRIC_MAPPINGS, {}),
        )
        if not mappings:
            mappings = self.storage.data.get("biometrics", {})
        if not mappings:
            mappings = DEFAULT_BIOMETRIC_MAPPINGS
        return mappings

    @property
    def biometric_slots_count(self) -> int:
        """Return number of configured biometric slots."""
        raw = self.entry.options.get(
            CONF_BIOMETRIC_SLOTS_COUNT,
            self.entry.data.get(CONF_BIOMETRIC_SLOTS_COUNT, DEFAULT_BIOMETRIC_SLOTS_COUNT),
        )
        try:
            return int(float(raw))
        except (ValueError, TypeError):
            return DEFAULT_BIOMETRIC_SLOTS_COUNT

    async def async_setup(self) -> None:
        """Initialize storage, restore timers, and schedule checks."""
        await self.storage.async_load()

        # Update storage with entry settings
        await self.storage.async_set_slots_count(self.slots_count)
        await self.storage.async_set_locks(self.locks)
        await self.storage.async_set_biometrics(self.biometric_mappings)

        # Restore active countdown timers from storage
        self._restore_timers()

        # Schedule recurring schedule check (runs every minute or on change)
        unsub_time = async_track_time_change(
            self.hass, self._async_scheduled_check, second=0
        )
        self._unsub_callbacks.append(unsub_time)

        # Schedule daily 3:00 AM lock code synchronization (replaces legacy package periodic sync)
        unsub_daily = async_track_time_change(
            self.hass, self._async_daily_sync, hour=3, minute=0, second=0
        )
        self._unsub_callbacks.append(unsub_daily)

        # Track Yale / Z-Wave alarm level sensors for keypad & biometric unlocks
        alarm_sensors: list[str] = []
        for lock_id in self.locks:
            name = lock_id.split(".", 1)[-1]
            alarm_sensors.append(f"sensor.{name}_alarm_level")

        if alarm_sensors:
            unsub_alarm = async_track_state_change_event(
                self.hass, alarm_sensors, self._async_handle_alarm_sensor_change
            )
            self._unsub_callbacks.append(unsub_alarm)

        # Listen for Z-Wave / Lock events to catch keypad/biometric unlocks
        unsub_event = self.hass.bus.async_listen(
            "zwave_js_notification", self._handle_zwave_notification
        )
        self._unsub_callbacks.append(unsub_event)
        unsub_value_event = self.hass.bus.async_listen(
            "zwave_js_value_notification", self._handle_zwave_notification
        )
        self._unsub_callbacks.append(unsub_value_event)

        # Initial schedule evaluation
        await self.async_evaluate_schedules()

    def _restore_timers(self) -> None:
        """Restore active timers that survived HA restart."""
        now = dt_util.utcnow()
        for slot_key, slot_data in self.storage.data.get("slots", {}).items():
            expires_str = slot_data.get("timer_expires_at")
            if not expires_str:
                continue

            try:
                expires_at = dt_util.parse_datetime(expires_str)
                if not expires_at:
                    continue

                slot_num = int(slot_key)
                if expires_at <= now:
                    # Timer expired while HA was offline
                    self.hass.async_create_task(
                        self._async_handle_timer_expired(slot_num)
                    )
                else:
                    # Reschedule timer callback
                    @callback
                    def _restore_timer_cb(now_dt: datetime, s: int = slot_num) -> None:
                        self.hass.async_create_task(
                            self._async_handle_timer_expired(s)
                        )

                    unsub = async_track_point_in_time(
                        self.hass,
                        _restore_timer_cb,
                        expires_at,
                    )
                    self._timer_unsubs[str(slot_key)] = unsub
            except Exception as err:
                _LOGGER.error("Failed to restore timer for slot %s: %s", slot_key, err)

    @callback
    def _async_daily_sync(self, now: datetime) -> None:
        """Periodic 3:00 AM maintenance sync across all configured locks."""
        _LOGGER.info("Starting daily 3:00 AM lock code maintenance synchronization")
        self.hass.async_create_task(self.async_sync_all_locks())

    @callback
    def _async_scheduled_check(self, now: datetime) -> None:
        """Periodic schedule evaluator callback."""
        self.hass.async_create_task(self.async_evaluate_schedules())

    async def async_evaluate_schedules(self) -> None:
        """Check all slot schedules against current local day and time."""
        now_local = dt_util.now()
        now_utc = dt_util.utcnow()
        current_day = now_local.strftime("%A")
        current_time_str = now_local.strftime("%H:%M:%S")

        slots = self.storage.data.get("slots", {})

        # Defensive sweep: clean up any expired timers that may have been missed
        for slot_id_str, slot_data in list(slots.items()):
            expires_str = slot_data.get("timer_expires_at")
            if expires_str:
                try:
                    exp_dt = dt_util.parse_datetime(expires_str)
                    if exp_dt and exp_dt <= now_utc:
                        _LOGGER.info(
                            "Periodic sweep found expired timer for slot %s (expired at %s)",
                            slot_id_str,
                            expires_str,
                        )
                        await self._async_handle_timer_expired(int(slot_id_str))
                except Exception as err:
                    _LOGGER.error(
                        "Error checking timer expiry for slot %s: %s",
                        slot_id_str,
                        err,
                    )
        for slot_id_str, slot in slots.items():
            slot_id = int(slot_id_str)
            if not slot.get("schedule_enabled", False):
                continue

            # Don't override an active temporary duration timer with schedule
            if slot.get("timer_expires_at") is not None:
                continue

            allowed_days = slot.get("schedule_days", [])
            start_time = slot.get("schedule_start", "00:00:00")
            end_time = slot.get("schedule_end", "23:59:59")

            is_correct_day = current_day in allowed_days
            is_within_time = start_time <= current_time_str < end_time
            should_be_enabled = is_correct_day and is_within_time
            currently_enabled = slot.get("enabled", False)

            if should_be_enabled != currently_enabled:
                _LOGGER.info(
                    "Schedule rule updating slot %s: currently %s -> new state %s",
                    slot_id,
                    currently_enabled,
                    should_be_enabled,
                )
                if should_be_enabled:
                    await self.async_enable_code(slot_id, update_hardware=True)
                else:
                    await self.async_disable_code(slot_id, update_hardware=True)

    async def async_set_code(
        self,
        slot: int,
        pin: str,
        name: str | None = None,
        enabled: bool = True,
        guest_mode: bool = False,
        duration: float | int | None = None,
        duration_unit: str | None = None,
        timer_action: str | None = None,
        schedule_enabled: bool | None = None,
        schedule_days: list[str] | None = None,
        schedule_start: str | None = None,
        schedule_end: str | None = None,
        is_timed: bool | None = None,
        notify_on_active: bool | None = None,
    ) -> None:
        """Set user PIN code and slot parameters."""
        slot_data = self.storage.get_slot(slot)
        was_enabled = slot_data.get("enabled", False)
        # If starting a temporary timer, force enabled state to True
        effective_enabled = True if is_timed is True else enabled

        updates: dict[str, Any] = {
            "pin": str(pin).strip(),
            "enabled": effective_enabled,
            "guest_mode": guest_mode if guest_mode is not None else slot_data.get("guest_mode", False),
        }
        if name is not None:
            updates["name"] = name
        if duration is not None:
            updates["duration"] = float(duration)
        if duration_unit is not None:
            updates["duration_unit"] = duration_unit
        if timer_action is not None:
            updates["timer_action"] = timer_action
        if schedule_enabled is not None:
            updates["schedule_enabled"] = schedule_enabled
        if schedule_days is not None:
            updates["schedule_days"] = schedule_days
        if schedule_start is not None:
            updates["schedule_start"] = schedule_start
        if schedule_end is not None:
            updates["schedule_end"] = schedule_end
        if notify_on_active is not None:
            updates["notify_on_active"] = notify_on_active

        await self.storage.async_update_slot(slot, updates)

        # Handle temporary duration timer if specified
        if is_timed is True and updates.get("duration", 0) > 0:
            await self.async_start_slot_timer(
                slot,
                duration=updates["duration"],
                timer_action=updates.get("timer_action", TIMER_ACTION_CLEAR),
                duration_unit=updates.get("duration_unit", "hours"),
            )
        elif is_timed is False:
            self.async_cancel_slot_timer(slot)

        # Push to physical locks if enabled
        if effective_enabled:
            await self._async_push_slot_to_locks(slot)
        else:
            await self._async_clear_slot_from_locks(slot)

        async_dispatcher_send(self.hass, SIGNAL_SLOT_UPDATED, slot)

        # Fire bus events on state transitions
        if not was_enabled and effective_enabled:
            self.hass.bus.async_fire(
                EVENT_SLOT_ENABLED,
                {
                    "slot": slot,
                    "name": updates.get("name", slot_data.get("name", f"Slot {slot}")),
                    "guest_mode": updates.get("guest_mode", slot_data.get("guest_mode", False)),
                    "schedule_enabled": updates.get("schedule_enabled", slot_data.get("schedule_enabled", False)),
                    "notify_on_active": updates.get("notify_on_active", slot_data.get("notify_on_active", False)),
                },
            )
        elif was_enabled and not effective_enabled:
            self.hass.bus.async_fire(
                EVENT_SLOT_DISABLED,
                {
                    "slot": slot,
                    "name": updates.get("name", slot_data.get("name", f"Slot {slot}")),
                    "guest_mode": updates.get("guest_mode", slot_data.get("guest_mode", False)),
                    "schedule_enabled": updates.get("schedule_enabled", slot_data.get("schedule_enabled", False)),
                    "notify_on_active": updates.get("notify_on_active", slot_data.get("notify_on_active", False)),
                },
            )

    async def async_clear_code(self, slot: int) -> None:
        """Clear user code from storage and physical locks."""
        slot_data = self.storage.get_slot(slot)
        was_enabled = slot_data.get("enabled", False)
        self.async_cancel_slot_timer(slot)
        await self.storage.async_clear_slot(slot)
        await self._async_clear_slot_from_locks(slot)
        async_dispatcher_send(self.hass, SIGNAL_SLOT_UPDATED, slot)
        if was_enabled:
            self.hass.bus.async_fire(
                EVENT_SLOT_DISABLED,
                {
                    "slot": slot,
                    "name": slot_data.get("name", f"Slot {slot}"),
                    "guest_mode": slot_data.get("guest_mode", False),
                    "schedule_enabled": slot_data.get("schedule_enabled", False),
                    "notify_on_active": slot_data.get("notify_on_active", False),
                },
            )

    async def async_enable_code(self, slot: int, update_hardware: bool = True) -> None:
        """Enable code slot."""
        slot_data = self.storage.get_slot(slot)
        pin = slot_data.get("pin", "")
        if not pin or len(pin) < 4:
            _LOGGER.warning("Cannot enable slot %s: invalid or empty PIN", slot)
            return

        await self.storage.async_update_slot(slot, {"enabled": True})
        if update_hardware:
            await self._async_push_slot_to_locks(slot)
        async_dispatcher_send(self.hass, SIGNAL_SLOT_UPDATED, slot)
        self.hass.bus.async_fire(
            EVENT_SLOT_ENABLED,
            {
                "slot": slot,
                "name": slot_data.get("name", f"Slot {slot}"),
                "guest_mode": slot_data.get("guest_mode", False),
                "schedule_enabled": slot_data.get("schedule_enabled", False),
                "notify_on_active": slot_data.get("notify_on_active", False),
            },
        )

    async def async_disable_code(self, slot: int, update_hardware: bool = True) -> None:
        """Disable code slot."""
        slot_data = self.storage.get_slot(slot)
        self.async_cancel_slot_timer(slot)
        await self.storage.async_update_slot(slot, {"enabled": False})
        if update_hardware:
            await self._async_clear_slot_from_locks(slot)
        async_dispatcher_send(self.hass, SIGNAL_SLOT_UPDATED, slot)
        self.hass.bus.async_fire(
            EVENT_SLOT_DISABLED,
            {
                "slot": slot,
                "name": slot_data.get("name", f"Slot {slot}"),
                "guest_mode": slot_data.get("guest_mode", False),
                "schedule_enabled": slot_data.get("schedule_enabled", False),
                "notify_on_active": slot_data.get("notify_on_active", False),
            },
        )

    async def async_start_slot_timer(
        self,
        slot: int,
        duration: float | int,
        timer_action: str,
        duration_unit: str = "hours",
    ) -> None:
        """Start a countdown access timer for a slot."""
        self.async_cancel_slot_timer(slot)
        dur = float(duration)
        if duration_unit == "minutes":
            delta = timedelta(minutes=dur)
        else:
            delta = timedelta(hours=dur)
        expires_at = dt_util.utcnow() + delta
        await self.storage.async_update_slot(
            slot,
            {
                "timer_expires_at": expires_at.isoformat(),
                "timer_action": timer_action,
                "duration": dur,
                "duration_unit": duration_unit,
                "enabled": True,
            },
        )

        @callback
        def _timer_expired(now_dt: datetime) -> None:
            self.hass.async_create_task(self._async_handle_timer_expired(slot))

        unsub = async_track_point_in_time(
            self.hass,
            _timer_expired,
            expires_at,
        )
        self._timer_unsubs[str(slot)] = unsub
        # Ensure PIN code is pushed to physical locks when timer starts
        await self._async_push_slot_to_locks(slot)
        async_dispatcher_send(self.hass, SIGNAL_SLOT_UPDATED, slot)

    def async_cancel_slot_timer(self, slot: int) -> None:
        """Cancel an active countdown timer for a slot."""
        slot_key = str(slot)
        if slot_key in self._timer_unsubs:
            self._timer_unsubs[slot_key]()
            del self._timer_unsubs[slot_key]

        slot_data = self.storage.get_slot(slot)
        if slot_data.get("timer_expires_at"):
            self.hass.async_create_task(
                self.storage.async_update_slot(slot, {"timer_expires_at": None})
            )

    async def _async_handle_timer_expired(self, slot: int) -> None:
        """Handle expiration of temporary access timer."""
        _LOGGER.info("Temporary access timer expired for slot %s", slot)
        slot_data = self.storage.get_slot(slot)
        action = slot_data.get("timer_action", TIMER_ACTION_CLEAR)

        await self.storage.async_update_slot(slot, {"timer_expires_at": None})
        if action == TIMER_ACTION_CLEAR:
            await self.async_clear_code(slot)
        else:
            await self.async_disable_code(slot, update_hardware=True)

    async def async_sync_all_locks(self) -> None:
        """Synchronize all enabled slots to all configured physical locks."""
        _LOGGER.info("Starting synchronization across %s locks", len(self.locks))
        slots = self.storage.data.get("slots", {})

        for slot_str, slot_data in slots.items():
            slot_id = int(slot_str)
            if slot_data.get("enabled", False) and slot_data.get("pin"):
                await self._async_push_slot_to_locks(slot_id)
            else:
                await self._async_clear_slot_from_locks(slot_id)
            # Brief gentle async pause between slot updates to prevent mesh congestion
            await asyncio.sleep(0.5)

    async def _async_push_slot_to_locks(self, slot: int) -> None:
        """Push PIN code to all physical locks."""
        slot_data = self.storage.get_slot(slot)
        pin = slot_data.get("pin", "")
        name = slot_data.get("name", f"Slot {slot}")

        if not pin:
            return

        for lock_entity in self.locks:
            provider = get_lock_provider(self.hass, lock_entity)
            await provider.async_set_usercode(lock_entity, slot, pin, name)
            await asyncio.sleep(0.5)

    async def _async_clear_slot_from_locks(self, slot: int) -> None:
        """Clear user code from all physical locks."""
        for lock_entity in self.locks:
            provider = get_lock_provider(self.hass, lock_entity)
            await provider.async_clear_usercode(lock_entity, slot)
            await asyncio.sleep(0.5)

    def generate_random_pin(self, length: int = 6) -> str:
        """Generate a secure random numeric PIN code."""
        return "".join([str(random.randint(0, 9)) for _ in range(length)])

    def get_lock_user_info(
        self, alarm_type: int | str, alarm_level: int | str
    ) -> dict[str, Any]:
        """Translate Yale alarmType and alarmLevel into user details."""
        a_type = str(alarm_type).strip()
        a_level = str(alarm_level).strip()

        person_name = "Unknown"
        is_family = False
        is_guest = False

        if a_type == "145":
            # Biometric fingerprint
            person_name = self.biometric_mappings.get(
                a_level, f"Family Member {a_level}"
            )
            is_family = True
        elif a_type == "19":
            # Keypad PIN unlock
            slot_data = self.storage.get_slot(a_level)
            person_name = slot_data.get("name") or f"Slot {a_level}"
            is_family = person_name.lower() in ["family", "homeowner"]
            is_guest = bool(slot_data.get("guest_mode", False))

        return {
            "person_name": person_name,
            "is_family": bool(is_family),
            "is_guest": bool(is_guest),
            "slot": str(a_level),
            "type": str(a_type),
        }

    async def async_handle_unlock_event(
        self,
        door: str,
        method: str,
        slot: int | str,
        alarm_type: str | None = None,
    ) -> None:
        """Process door unlock event, update activity, and auto-activate Guest Mode."""
        now_ts = dt_util.utcnow().timestamp()
        slot_str = str(slot).strip()
        door_str = str(door).strip()

        # Debounce: avoid duplicate processing within 3 seconds for the same door & slot
        if (
            self._last_unlock_event.get("slot") == slot_str
            and self._last_unlock_event.get("door") == door_str
            and (now_ts - self._last_unlock_event.get("time", 0)) < 3.0
        ):
            _LOGGER.debug(
                "Debouncing duplicate unlock event for %s slot %s", door_str, slot_str
            )
            return

        self._last_unlock_event = {
            "slot": slot_str,
            "door": door_str,
            "time": now_ts,
        }

        is_biometric = method == "Fingerprint" or str(alarm_type) == "145"

        if is_biometric:
            method_name = "Fingerprint"
            actor = self.biometric_mappings.get(slot_str, f"Family Member {slot_str}")
            is_family = True
            is_guest = False
        else:
            method_name = "Keypad"
            slot_data = self.storage.get_slot(slot_str)
            actor = slot_data.get("name") or f"Slot {slot_str}"
            is_family = actor.lower() in ["family", "homeowner"]
            is_guest = bool(slot_data.get("guest_mode", False))

        self.last_activity = {
            "door": door_str,
            "actor": actor,
            "method": method_name,
            "slot": slot_str,
            "timestamp": dt_util.now().isoformat(),
            "is_family": is_family,
            "is_guest": is_guest,
        }

        _LOGGER.info(
            "Door unlock detected: %s on %s by %s (Slot %s, Guest Mode: %s)",
            method_name,
            door_str,
            actor,
            slot_str,
            is_guest,
        )

        # Directly activate Guest Mode helper if the slot has guest mode enabled
        if is_guest:
            guest_mode_entity = "input_boolean.guest_mode"
            if self.hass.states.get(guest_mode_entity):
                _LOGGER.info(
                    "Guest Mode code used (Slot %s: %s). Activating %s",
                    slot_str,
                    actor,
                    guest_mode_entity,
                )
                try:
                    await self.hass.services.async_call(
                        "input_boolean",
                        "turn_on",
                        {"entity_id": guest_mode_entity},
                        blocking=False,
                    )
                except Exception as err:
                    _LOGGER.error("Failed to activate %s: %s", guest_mode_entity, err)

        try:
            self.hass.bus.async_fire(EVENT_LOCK_ACCESS, self.last_activity)
            async_dispatcher_send(self.hass, SIGNAL_ACTIVITY_UPDATED)
        except Exception as err:
            _LOGGER.debug("Error dispatching activity update: %s", err)

    @callback
    def _async_handle_alarm_sensor_change(self, event: Event) -> None:
        """Handle state change on sensor.*_alarm_level."""
        new_state = event.data.get("new_state")
        if not new_state or not new_state.state:
            return

        state_val = str(new_state.state).strip()
        if not state_val.isdigit() or int(state_val) <= 0:
            return

        slot = int(state_val)
        entity_id = event.data.get("entity_id", "")

        type_sensor_id = entity_id.replace("_alarm_level", "_alarm_type")
        type_state = self.hass.states.get(type_sensor_id)
        alarm_type = type_state.state.strip() if type_state else ""

        if alarm_type not in ["19", "145"]:
            return

        lock_entity_id = entity_id.replace("sensor.", "lock.").replace("_alarm_level", "")
        lock_state = self.hass.states.get(lock_entity_id)
        if lock_state and lock_state.attributes.get("friendly_name"):
            door_name = lock_state.attributes["friendly_name"]
        else:
            raw_door = entity_id.split(".")[1].replace("_alarm_level", "")
            door_name = raw_door.replace("_", " ").title()

        method = "Fingerprint" if alarm_type == "145" else "Keypad"

        self.hass.async_create_task(
            self.async_handle_unlock_event(
                door=door_name,
                method=method,
                slot=slot,
                alarm_type=alarm_type,
            )
        )

    @callback
    def _handle_zwave_notification(self, event: Event) -> None:
        """Capture Z-Wave lock keypad / biometric notification events."""
        data = event.data
        parameters = data.get("parameters", {})
        user_code_id = parameters.get("userId") or parameters.get("userCode")
        event_label = data.get("event_label", "")

        if "Keypad unlock operation" in event_label or user_code_id:
            try:
                slot = int(user_code_id) if user_code_id else 1
            except (ValueError, TypeError):
                slot = 1

            node_id = data.get("node_id", "Door Lock")
            door_name = str(node_id)
            for lock_entity in self.locks:
                st = self.hass.states.get(lock_entity)
                if st and (st.attributes.get("node_id") == node_id):
                    door_name = st.attributes.get("friendly_name", lock_entity)
                    break

            self.hass.async_create_task(
                self.async_handle_unlock_event(
                    door=door_name,
                    method="Keypad",
                    slot=slot,
                    alarm_type="19",
                )
            )

    async def async_import_from_yaml_helpers(self) -> int:
        """Scan HA states for existing input_* helpers and import into .storage."""
        _LOGGER.info("Starting automatic import from package YAML helpers...")
        imported_count = 0

        for i in range(1, 31):
            name_entity = f"input_text.lock_code_name_{i}"
            pin_entity = f"input_text.lock_code_pin_{i}"
            enabled_entity = f"input_boolean.lock_code_enabled_{i}"
            guest_entity = f"input_boolean.lock_guest_mode_enabled_{i}"
            dur_entity = f"input_number.lock_code_duration_{i}"
            action_entity = f"input_select.lock_timer_action_{i}"
            sched_en_entity = f"input_boolean.lock_schedule_enabled_{i}"
            sched_days_entity = f"input_text.lock_schedule_days_{i}"
            start_entity = f"input_datetime.lock_schedule_start_time_{i}"
            end_entity = f"input_datetime.lock_schedule_end_time_{i}"

            name_state = self.hass.states.get(name_entity)
            pin_state = self.hass.states.get(pin_entity)

            # Check if this slot helper exists
            if not name_state and not pin_state:
                continue

            existing_slot = self.storage.get_slot(i)
            # If the storage slot is already active/has a PIN and helper has no PIN, do NOT wipe it
            if existing_slot.get("pin") and not pin_val:
                _LOGGER.info(
                    "Skipping YAML import for Slot %s: storage already has active PIN and helper is empty",
                    i,
                )
                continue

            name_val = name_state.state if name_state else f"Slot {i}"
            pin_val = pin_state.state if pin_state else ""
            enabled_val = (
                self.hass.states.get(enabled_entity).state == "on"
                if self.hass.states.get(enabled_entity)
                else False
            )
            guest_val = (
                self.hass.states.get(guest_entity).state == "on"
                if self.hass.states.get(guest_entity)
                else False
            )
            dur_val = (
                int(float(self.hass.states.get(dur_entity).state))
                if self.hass.states.get(dur_entity)
                else 1
            )
            action_val = (
                self.hass.states.get(action_entity).state
                if self.hass.states.get(action_entity)
                else TIMER_ACTION_CLEAR
            )
            sched_en_val = (
                self.hass.states.get(sched_en_entity).state == "on"
                if self.hass.states.get(sched_en_entity)
                else False
            )

            days_raw = (
                self.hass.states.get(sched_days_entity).state
                if self.hass.states.get(sched_days_entity)
                else ""
            )
            sched_days_val = (
                [d.strip() for d in days_raw.split(",") if d.strip()]
                if days_raw
                else list(DAYS_OF_WEEK)
            )

            start_val = (
                self.hass.states.get(start_entity).state
                if self.hass.states.get(start_entity)
                else "00:00:00"
            )
            end_val = (
                self.hass.states.get(end_entity).state
                if self.hass.states.get(end_entity)
                else "23:59:59"
            )

            slot_payload = {
                "slot": i,
                "name": name_val,
                "pin": pin_val,
                "enabled": enabled_val,
                "guest_mode": guest_val,
                "duration": dur_val,
                "timer_action": action_val,
                "timer_expires_at": None,
                "schedule_enabled": sched_en_val,
                "schedule_days": sched_days_val,
                "schedule_start": start_val,
                "schedule_end": end_val,
            }

            await self.storage.async_update_slot(i, slot_payload)
            imported_count += 1
            _LOGGER.info("Imported YAML helper data for Slot %s: %s", i, name_val)

        if imported_count > 0:
            await self.storage.async_set_slots_count(int(max(imported_count, self.slots_count)))
            async_dispatcher_send(self.hass, SIGNAL_SLOT_UPDATED, 0)

        _LOGGER.info("Completed import: %s slots imported into storage", imported_count)
        return imported_count

    async def async_unload(self) -> None:
        """Cancel all callbacks and timers."""
        for unsub in self._unsub_callbacks:
            unsub()
        self._unsub_callbacks.clear()

        for unsub in self._timer_unsubs.values():
            unsub()
        self._timer_unsubs.clear()
