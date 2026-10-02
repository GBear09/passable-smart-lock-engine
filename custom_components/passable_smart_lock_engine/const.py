"""Constants for Passable Smart Lock Engine."""

from typing import Final

DOMAIN: Final = "passable_smart_lock_engine"
NAME: Final = "Passable Smart Lock Engine"
VERSION: Final = "1.2.0"

# Configuration & Options keys
CONF_LOCKS: Final = "locks"
CONF_SLOTS_COUNT: Final = "slots_count"
CONF_BIOMETRIC_MAPPINGS: Final = "biometric_mappings"
CONF_BIOMETRIC_SLOTS_COUNT: Final = "biometric_slots_count"
CONF_IMPORT_HELPERS: Final = "import_helpers"

DEFAULT_BIOMETRIC_MAPPINGS: Final = {
    "1": "Myles",
    "2": "Megan",
    "3": "Madeleine",
    "4": "Margaret",
}

DEFAULT_SLOTS_COUNT: Final = 10
MIN_SLOTS_COUNT: Final = 1
MAX_SLOTS_COUNT: Final = 30

DEFAULT_BIOMETRIC_SLOTS_COUNT: Final = 4
MIN_BIOMETRIC_SLOTS_COUNT: Final = 1
MAX_BIOMETRIC_SLOTS_COUNT: Final = 20

# Storage
STORAGE_KEY: Final = "passable_smart_lock_engine.storage"
STORAGE_VERSION: Final = 1

# Supported Platforms
PLATFORMS: Final = ["switch", "sensor", "button", "event"]

# Service Names
SERVICE_SET_CODE: Final = "set_code"
SERVICE_CLEAR_CODE: Final = "clear_code"
SERVICE_ENABLE_CODE: Final = "enable_code"
SERVICE_DISABLE_CODE: Final = "disable_code"
SERVICE_SYNC_LOCKS: Final = "sync_locks"
SERVICE_GENERATE_PIN: Final = "generate_random_pin"
SERVICE_IMPORT_HELPERS: Final = "import_from_yaml_helpers"
SERVICE_GET_USER_INFO: Final = "get_lock_user_info"
SERVICE_MANAGE_LOCK_CODES: Final = "manage_lock_codes"

# Events
EVENT_LOCK_ACCESS: Final = "passable_smart_lock_engine_access"
EVENT_SLOT_ENABLED: Final = "passable_smart_lock_engine_slot_enabled"
EVENT_SLOT_DISABLED: Final = "passable_smart_lock_engine_slot_disabled"

# Days of the week
DAYS_OF_WEEK: Final = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
]

# Recurrence options
RECURRENCE_WEEKLY: Final = "weekly"
RECURRENCE_BIWEEKLY: Final = "biweekly"
RECURRENCE_MODES: Final = [RECURRENCE_WEEKLY, RECURRENCE_BIWEEKLY]

# Action types
ACTION_SET: Final = "set"
ACTION_CLEAR: Final = "clear"
ACTION_SET_TIMED: Final = "set_timed"
ACTION_ENABLE: Final = "enable"
ACTION_DISABLE: Final = "disable"
ACTION_SYNC: Final = "sync"

# Timer actions
TIMER_ACTION_CLEAR: Final = "Clear Code"
TIMER_ACTION_DISABLE: Final = "Disable Code"

# Frontend card integration
FRONTEND_URL_PATH: Final = "/passable_smart_lock_engine/passable-lock-manager-card.js"
