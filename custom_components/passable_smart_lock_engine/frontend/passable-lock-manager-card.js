import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit@3.0.0/index.js?module";

const CARD_VERSION = "2.1.2";

console.info(
  `%c PASSABLE-LOCK-MANAGER-CARD %c v${CARD_VERSION} `,
  "color: white; background: #2196f3; font-weight: bold;",
  "color: white; background: #10b981; font-weight: bold;"
);

// --- INLINE ICONS (Extracted from Lucide & MDI) ---
const Icons = {
  Lock: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>`,
  Unlock: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>`,
  Door: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
    <path d="M2 20h20" />
    <path d="M14 12v.01" />
  </svg>`,
  Battery: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
    <line x1="22" x2="22" y1="11" y2="13" />
  </svg>`,
  AlertTriangle: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>`,
  User: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>`,
  Clock: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>`,
  ClockLg: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>`,
  History: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <polyline points="12 7 12 12 15 15" />
  </svg>`,
  Trash2: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>`,
  RefreshCw: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>`,
  Save: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>`,
  ArrowLeft: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>`,
  Key: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
    <path d="m21 2-9.6 9.6" />
    <circle cx="7.5" cy="15.5" r="5.5" />
  </svg>`,
  ShieldAlert: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M20 13c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3 8 3v8Z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>`,
  Calendar: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>`,
  ChevronDown: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>`,
  ChevronUp: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>`,
  Play: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>`,
  Check: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>`,
};

class PassableLockManagerCard extends LitElement {
  static getConfigElement() {
    return document.createElement("passable-lock-manager-card-editor");
  }

  static getStubConfig() {
    return {
      title: "Entry Door Locks & Access",
      subtitle: "Smart Lock Command Center",
      slots: 10,
      manage_script: "script.manage_lock_codes",
      collapse_inactive_slots: true,
      show_lock_all: true,
      show_timeline: true,
      timeline_hours: 24,
      max_events: 10,
      default_expand_activity: false,
      locks: [
        {
          entity: "lock.front_door",
          name: "Front Door",
          battery: "sensor.front_door_battery_level",
          jammed: "binary_sensor.front_door_lock_jammed",
        },
        {
          entity: "lock.mudroom_door",
          name: "Mudroom Door",
          battery: "sensor.mudroom_door_battery_level",
          jammed: "binary_sensor.mudroom_door_lock_jammed",
        },
      ],
    };
  }

  static properties = {
    hass: { attribute: false },
    config: { state: true },
    _editingSlot: { state: true },
    _localName: { state: true },
    _localPin: { state: true },
    _openSections: { state: true },
    _expandedInactive: { state: true },
    _expandedRecentActivity: { state: true },
    _historyData: { state: true },
    _logbookEvents: { state: true },
    _selectedTimelineFilter: { state: true },
    _hoveredSegment: { state: true },
    _isFetchingActivity: { state: true },
  };

  constructor() {
    super();
    this._editingSlot = null;
    this._localName = "";
    this._localPin = "";
    this._openSections = {};
    this._expandedInactive = false;
    this._expandedRecentActivity = false;
    this._historyData = {};
    this._logbookEvents = [];
    this._selectedTimelineFilter = "all";
    this._hoveredSegment = null;
    this._isFetchingActivity = false;
    this._lastFetchTime = 0;
    this._fetchTimer = null;
    this._users = [];

    this._fullDaysList = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    this._shortDaysList = ["S", "M", "T", "W", "T", "F", "S"];
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchUsers();
    this._fetchActivityData();
    this._fetchTimer = setInterval(() => {
      this._fetchActivityData();
    }, 45000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._fetchTimer) {
      clearInterval(this._fetchTimer);
      this._fetchTimer = null;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("hass") && this.hass) {
      const now = Date.now();
      if (now - this._lastFetchTime > 30000) {
        this._fetchActivityData();
      }
    }
    if (changedProperties.has("config")) {
      if (this.config?.default_expand_activity !== undefined) {
        this._expandedRecentActivity = this.config.default_expand_activity;
      }
    }
  }

  async _fetchUsers() {
    if (this.hass && this.hass.user && this.hass.user.is_admin) {
      try {
        const users = await this.hass.connection.sendMessagePromise({
          type: "config/auth/list",
        });
        this._users = users.map((u) => ({ label: u.name, value: u.id }));
      } catch {
        // Silent catch
      }
    }
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration.");
    }
    this.config = {
      title: "Entry Door Locks & Access",
      subtitle: "Smart Lock Command Center",
      slots: 10,
      manage_script: "script.manage_lock_codes",
      collapse_inactive_slots: true,
      show_lock_all: true,
      show_timeline: true,
      timeline_hours: 24,
      max_events: 10,
      default_expand_activity: false,
      ...config,
    };
  }

  getCardSize() {
    return 6;
  }

  _callService(domain, service, data) {
    if (this.hass) {
      this.hass.callService(domain, service, data);
    }
  }

  // --- STATE EXTRACTORS ---
  _getEntity(entityId) {
    return this.hass?.states[entityId];
  }

  _getState(entityId, defaultVal = "") {
    const ent = this._getEntity(entityId);
    return ent ? ent.state : defaultVal;
  }

  // --- TIMESTAMP & STATE NORMALIZERS ---
  _parseTimestamp(val) {
    if (!val) return 0;
    if (typeof val === "number") {
      // If UNIX timestamp is in seconds (< 1e11), convert to milliseconds
      return val < 1e11 ? val * 1000 : val;
    }
    if (typeof val === "string") {
      if (!isNaN(Number(val)) && !val.includes("-") && !val.includes("T")) {
        const num = Number(val);
        return num < 1e11 ? num * 1000 : num;
      }
      const parsed = new Date(val).getTime();
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  _extractState(item) {
    if (!item) return "locked";
    if (typeof item === "string") return item.toLowerCase();
    const raw = item.state !== undefined ? item.state : item.s;
    return (raw || "locked").toString().toLowerCase();
  }

  _extractTimestamp(item) {
    if (!item) return 0;
    const raw =
      item.last_changed !== undefined
        ? item.last_changed
        : item.lc !== undefined
        ? item.lc
        : item.last_updated !== undefined
        ? item.last_updated
        : item.lu !== undefined
        ? item.lu
        : item.when;
    return this._parseTimestamp(raw);
  }

  // --- ROLE-BASED ACCESS CONTROL ---
  _canManagePins() {
    if (!this.hass) return false;
    const adminUsers = this.config?.admin_users;

    if (Array.isArray(adminUsers) && adminUsers.length > 0) {
      const currentUserId = this.hass.user?.id;
      const currentUserName = this.hass.user?.name;
      return (
        (currentUserId && adminUsers.includes(currentUserId)) ||
        (currentUserName && adminUsers.includes(currentUserName))
      );
    }

    if (this.config?.require_admin) {
      return this.hass.user?.is_admin === true;
    }

    return true;
  }

  // --- TIME & DURATION HELPERS ---
  _formatRelativeTime(isoString) {
    if (!isoString) return "";
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

      if (isNaN(diffSec) || diffSec < 0) return "";
      if (diffSec < 60) return "just now";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  }

  _formatDuration(ms) {
    if (ms <= 0) return "0m";
    const totalSec = Math.floor(ms / 1000);
    const totalMin = Math.floor(totalSec / 60);
    if (totalMin < 1) return "< 1m";
    if (totalMin < 60) return `${totalMin}m`;
    const hours = Math.floor(totalMin / 60);
    const remainingMin = totalMin % 60;
    if (remainingMin === 0) return `${hours}h`;
    return `${hours}h ${remainingMin}m`;
  }

  // --- DOOR LOCK CONTROLS ---
  _getNormalizedLocks() {
    const raw = this.config?.locks;
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((item) => {
      if (typeof item === "string") {
        return { entity: item };
      }
      return item;
    });
  }

  _toggleLock(lockEntity, currentState) {
    if (!this.hass || !lockEntity) return;
    if (currentState === "locked") {
      this._callService("lock", "unlock", { entity_id: lockEntity });
    } else {
      this._callService("lock", "lock", { entity_id: lockEntity });
    }
  }

  _lockAllDoors(locks) {
    if (!this.hass || !locks || locks.length === 0) return;
    const unlockedEntities = locks
      .filter((l) => {
        const state = this._getState(l.entity);
        return state !== "locked";
      })
      .map((l) => l.entity);

    if (unlockedEntities.length > 0) {
      this._callService("lock", "lock", { entity_id: unlockedEntities });
    }
  }

  // --- WEBSOCKET ACTIVITY & LOGBOOK FETCHING ---
  async _fetchActivityData() {
    if (!this.hass || this._isFetchingActivity) return;
    const locks = this._getNormalizedLocks();
    const lockEntities = locks.map((l) => l.entity).filter(Boolean);
    if (lockEntities.length === 0) return;

    this._isFetchingActivity = true;
    this._lastFetchTime = Date.now();
    const hours = this.config?.timeline_hours || 24;
    const startTime = new Date(Date.now() - hours * 3600 * 1000).toISOString();

    try {
      // 1. Fetch State History for Continuous Timeline Bar
      const historyPromise = this.hass.callWS({
        type: "history/history_during_period",
        start_time: startTime,
        entity_ids: lockEntities,
        minimal_response: true,
        significant_changes_only: true,
      });

      // 2. Fetch Logbook Events for Detailed Feed
      const logbookPromise = this.hass.callWS({
        type: "logbook/get_events",
        start_time: startTime,
        entity_ids: lockEntities,
      });

      const [historyData, logbookData] = await Promise.all([
        historyPromise.catch(() => null),
        logbookPromise.catch(() => null),
      ]);

      if (historyData) {
        this._historyData = historyData;
      }
      if (logbookData) {
        this._logbookEvents = this._processLogbookEvents(logbookData, locks);
      }
    } catch (err) {
      console.warn("PassableLockManager: Activity fetch error", err);
    } finally {
      this._isFetchingActivity = false;
      this.requestUpdate();
    }
  }

  _processLogbookEvents(rawEvents, locks) {
    if (!rawEvents || !Array.isArray(rawEvents)) return [];

    const doorNameMap = {};
    locks.forEach((l) => {
      const lockObj = this._getEntity(l.entity);
      doorNameMap[l.entity] =
        l.name ||
        lockObj?.attributes?.friendly_name ||
        l.entity.replace("lock.", "").replace(/_/g, " ");
    });

    const processed = rawEvents.map((ev) => {
      const entityId = ev.entity_id;
      const doorName = doorNameMap[entityId] || ev.name || entityId;
      const rawState = (ev.state || "").toLowerCase();
      const rawMsg = (ev.message || "").toLowerCase();

      const isLocked =
        rawState === "locked" ||
        (rawMsg.includes("locked") && !rawMsg.includes("unlocked"));
      const isJammed =
        rawState === "jammed" || rawMsg.includes("jammed");
      const isUnlocked = !isLocked && !isJammed;

      const rawWhen = ev.when;
      const timeMs = this._parseTimestamp(rawWhen);
      const when = new Date(timeMs);

      // Identity Resolution
      let actor = "";
      let sourceIcon = "manual";

      // 1. PIN Slot Match
      const slotMatch =
        rawMsg.match(/slot\s*(\d+)/i) ||
        rawMsg.match(/code\s*slot\s*(\d+)/i) ||
        rawMsg.match(/pin\s*(\d+)/i) ||
        rawMsg.match(/user\s*code\s*(\d+)/i);

      if (slotMatch && slotMatch[1]) {
        const slotNum = parseInt(slotMatch[1], 10);
        const slotName = this._getState(`input_text.lock_code_name_${slotNum}`);
        if (slotName) {
          actor = `${slotName} (Slot #${slotNum})`;
        } else {
          actor = `PIN Code (Slot #${slotNum})`;
        }
        sourceIcon = "pin";
      }

      // 2. Context Name
      if (!actor && ev.context_name) {
        actor = ev.context_name;
        sourceIcon = "user";
      }

      // 3. Context User ID
      if (!actor && ev.context_user_id) {
        if (this._users && this._users.length > 0) {
          const matchedUser = this._users.find(
            (u) => u.value === ev.context_user_id
          );
          if (matchedUser) {
            actor = matchedUser.label;
            sourceIcon = "user";
          }
        }
        if (!actor && this.hass?.user?.id === ev.context_user_id) {
          actor = this.hass.user.name || "App User";
          sourceIcon = "user";
        }
      }

      // 4. Context Entity ID (Automation/Script)
      if (!actor && ev.context_entity_id) {
        const trigEnt = this._getEntity(ev.context_entity_id);
        actor =
          trigEnt?.attributes?.friendly_name ||
          ev.context_entity_id.split(".").pop().replace(/_/g, " ");
        sourceIcon = "automation";
      }

      // 5. General Fallbacks
      if (!actor) {
        if (
          rawMsg.includes("keypad") ||
          rawMsg.includes("code") ||
          rawMsg.includes("pin")
        ) {
          actor = "Keypad PIN";
          sourceIcon = "pin";
        } else if (rawMsg.includes("auto") || rawMsg.includes("schedule")) {
          actor = "Automation";
          sourceIcon = "automation";
        } else {
          actor = "Manual / Physical Key";
          sourceIcon = "manual";
        }
      }

      return {
        id: (ev.when || Math.random()) + "_" + entityId,
        entity_id: entityId,
        doorName,
        isLocked,
        isUnlocked,
        isJammed,
        actionLabel: isJammed ? "Jammed" : isLocked ? "Locked" : "Unlocked",
        actor,
        sourceIcon,
        when,
        timeStr: when.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        relativeTime: this._formatRelativeTime(when.toISOString()),
      };
    });

    processed.sort((a, b) => b.when.getTime() - a.when.getTime());
    const maxEvents = this.config?.max_events || 10;
    return processed.slice(0, maxEvents);
  }

  // --- TIMELINE SEGMENTS COMPUTATION ---
  _calculateTimelineSegments() {
    const hours = this.config?.timeline_hours || 24;
    const windowMs = hours * 3600 * 1000;
    const now = Date.now();
    const windowStart = now - windowMs;
    const windowEnd = now;

    const locks = this._getNormalizedLocks();
    const filter = this._selectedTimelineFilter || "all";

    let targetEntities = [];
    if (filter === "all") {
      targetEntities = locks.map((l) => l.entity);
    } else {
      targetEntities = [filter];
    }

    if (targetEntities.length === 0 || !this._historyData) {
      return [];
    }

    if (targetEntities.length === 1) {
      const entityId = targetEntities[0];
      const rawStates = this._historyData[entityId] || [];
      return this._buildSegmentsForEntity(
        entityId,
        rawStates,
        windowStart,
        windowEnd,
        windowMs
      );
    }

    return this._buildCombinedSegments(
      targetEntities,
      windowStart,
      windowEnd,
      windowMs
    );
  }

  _buildSegmentsForEntity(
    entityId,
    rawStates,
    windowStart,
    windowEnd,
    windowMs
  ) {
    if (!rawStates || rawStates.length === 0) {
      const current = this._getState(entityId, "locked");
      return [
        {
          state: current,
          start: windowStart,
          end: windowEnd,
          pctStart: 0,
          pctWidth: 100,
          durationStr: `${Math.round(windowMs / 3600000)}h`,
          timeRangeStr: `${new Date(windowStart).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })} – Now`,
          entityId,
        },
      ];
    }

    const sorted = [...rawStates].sort(
      (a, b) => this._extractTimestamp(a) - this._extractTimestamp(b)
    );

    let currentState = this._extractState(sorted[0]);
    const futureChanges = [];

    for (let i = 0; i < sorted.length; i++) {
      const t = this._extractTimestamp(sorted[i]);
      const st = this._extractState(sorted[i]);
      if (t <= windowStart) {
        currentState = st;
      } else if (t <= windowEnd) {
        futureChanges.push({ time: t, state: st });
      }
    }

    const rawSegments = [];
    let currStart = windowStart;

    for (let i = 0; i < futureChanges.length; i++) {
      const change = futureChanges[i];
      if (change.time > currStart) {
        rawSegments.push({
          state: currentState,
          start: currStart,
          end: change.time,
        });
      }
      currStart = change.time;
      currentState = change.state;
    }

    if (currStart < windowEnd) {
      rawSegments.push({
        state: currentState,
        start: currStart,
        end: windowEnd,
      });
    }

    // Merge contiguous segments with identical state
    const merged = [];
    rawSegments.forEach((seg) => {
      const last = merged[merged.length - 1];
      if (last && last.state === seg.state) {
        last.end = seg.end;
      } else {
        merged.push({ ...seg });
      }
    });

    return merged.map((seg) => {
      const durMs = seg.end - seg.start;
      return {
        state: seg.state,
        start: seg.start,
        end: seg.end,
        pctStart: ((seg.start - windowStart) / windowMs) * 100,
        pctWidth: (durMs / windowMs) * 100,
        durationStr: this._formatDuration(durMs),
        timeRangeStr: `${new Date(seg.start).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })} – ${
          seg.end === windowEnd
            ? "Now"
            : new Date(seg.end).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })
        }`,
        entityId,
      };
    });
  }

  _buildCombinedSegments(targetEntities, windowStart, windowEnd, windowMs) {
    const timePoints = new Set([windowStart, windowEnd]);
    targetEntities.forEach((eid) => {
      const list = this._historyData[eid] || [];
      list.forEach((item) => {
        const t = this._extractTimestamp(item);
        if (t >= windowStart && t <= windowEnd) {
          timePoints.add(t);
        }
      });
    });

    const sortedTimes = Array.from(timePoints).sort((a, b) => a - b);
    const rawSegments = [];

    for (let i = 0; i < sortedTimes.length - 1; i++) {
      const tStart = sortedTimes[i];
      const tEnd = sortedTimes[i + 1];
      const midpoint = tStart + (tEnd - tStart) / 2;

      let compositeState = "locked";
      let anyUnlocked = false;
      let anyJammed = false;

      targetEntities.forEach((eid) => {
        const rawStates = this._historyData[eid] || [];
        let stateAtMid = this._getState(eid, "locked");

        if (rawStates.length > 0) {
          const sorted = [...rawStates].sort(
            (a, b) => this._extractTimestamp(a) - this._extractTimestamp(b)
          );
          stateAtMid = this._extractState(sorted[0]);
          for (let k = 0; k < sorted.length; k++) {
            const changeTime = this._extractTimestamp(sorted[k]);
            if (changeTime <= midpoint) {
              stateAtMid = this._extractState(sorted[k]);
            } else {
              break;
            }
          }
        }

        if (stateAtMid === "jammed") anyJammed = true;
        else if (stateAtMid === "unlocked") anyUnlocked = true;
      });

      if (anyJammed) compositeState = "jammed";
      else if (anyUnlocked) compositeState = "unlocked";
      else compositeState = "locked";

      const durMs = tEnd - tStart;
      if (durMs <= 0) continue;

      rawSegments.push({
        state: compositeState,
        start: tStart,
        end: tEnd,
      });
    }

    const merged = [];
    rawSegments.forEach((seg) => {
      const last = merged[merged.length - 1];
      if (last && last.state === seg.state) {
        last.end = seg.end;
      } else {
        merged.push({ ...seg });
      }
    });

    return merged.map((seg) => {
      const durMs = seg.end - seg.start;
      return {
        state: seg.state,
        start: seg.start,
        end: seg.end,
        pctStart: ((seg.start - windowStart) / windowMs) * 100,
        pctWidth: (durMs / windowMs) * 100,
        durationStr: this._formatDuration(durMs),
        timeRangeStr: `${new Date(seg.start).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })} – ${
          seg.end === windowEnd
            ? "Now"
            : new Date(seg.end).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })
        }`,
        entityId: "all",
      };
    });
  }

  _getTimeAxisTicks(hours) {
    if (hours <= 12) {
      return ["12h ago", "9h ago", "6h ago", "3h ago", "Now"];
    }
    if (hours <= 24) {
      return ["24h ago", "18h ago", "12h ago", "6h ago", "Now"];
    }
    if (hours <= 48) {
      return ["48h ago", "36h ago", "24h ago", "12h ago", "Now"];
    }
    return [
      `${hours}h ago`,
      `${Math.round(hours * 0.75)}h`,
      `${Math.round(hours * 0.5)}h`,
      `${Math.round(hours * 0.25)}h`,
      "Now",
    ];
  }

  // --- EVENT HANDLERS FOR SLOTS ---
  _openEdit(slot) {
    if (!this._canManagePins()) return;
    this._editingSlot = slot;
    this._localName = this._getState(`input_text.lock_code_name_${slot}`);
    this._localPin = this._getState(`input_text.lock_code_pin_${slot}`);
  }

  _closeEdit() {
    this._editingSlot = null;
  }

  _handleSave() {
    const slot = this._editingSlot;
    const scriptEntity =
      this.config?.manage_script || "script.manage_lock_codes";
    const [domain, service] = scriptEntity.split(".");

    this._callService("input_text", "set_value", {
      entity_id: `input_text.lock_code_name_${slot}`,
      value: this._localName,
    });
    this._callService("input_text", "set_value", {
      entity_id: `input_text.lock_code_pin_${slot}`,
      value: this._localPin,
    });
    this._callService(domain || "script", service || "manage_lock_codes", {
      action: "set",
      code_slot: slot.toString(),
    });
    this._closeEdit();
  }

  _handleGenerate() {
    let pin = "";
    for (let i = 0; i < 6; i++) {
      pin += Math.floor(Math.random() * 10);
    }
    this._localPin = pin;
  }

  _handleClear() {
    const slot = this._editingSlot;
    const scriptEntity =
      this.config?.manage_script || "script.manage_lock_codes";
    const [domain, service] = scriptEntity.split(".");

    if (confirm(`Delete code slot ${slot}?`)) {
      this._callService("input_text", "set_value", {
        entity_id: `input_text.lock_code_name_${slot}`,
        value: "",
      });
      this._callService("input_text", "set_value", {
        entity_id: `input_text.lock_code_pin_${slot}`,
        value: "",
      });
      this._callService("input_boolean", "turn_off", {
        entity_id: `input_boolean.lock_code_enabled_${slot}`,
      });
      this._callService(domain || "script", service || "manage_lock_codes", {
        action: "clear",
        code_slot: slot.toString(),
      });
      this._closeEdit();
    }
  }

  _toggleBoolean(entityId) {
    const state = this._getState(entityId);
    this._callService(
      "input_boolean",
      state === "on" ? "turn_off" : "turn_on",
      { entity_id: entityId }
    );
  }

  _toggleSection(section) {
    this._openSections = {
      ...this._openSections,
      [section]: !this._openSections[section],
    };
  }

  _toggleDay(day) {
    const slot = this._editingSlot;
    const schedEnabledEntId = `input_boolean.lock_schedule_enabled_${slot}`;
    const isSchedEnabled = this._getState(schedEnabledEntId) === "on";

    if (!isSchedEnabled) return;

    const schedDaysEntId = `input_text.lock_schedule_days_${slot}`;
    const currentStr = this._getState(
      schedDaysEntId,
      "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
    );
    let selectedDays = currentStr ? currentStr.split(",") : [];

    if (selectedDays.includes(day)) {
      selectedDays = selectedDays.filter((d) => d !== day);
    } else {
      selectedDays.push(day);
      selectedDays.sort(
        (a, b) => this._fullDaysList.indexOf(a) - this._fullDaysList.indexOf(b)
      );
    }
    this._callService("input_text", "set_value", {
      entity_id: schedDaysEntId,
      value: selectedDays.join(","),
    });
  }

  // --- MAIN RENDER ---
  render() {
    if (!this.hass) return html`<div class="loading">Loading...</div>`;

    return html`
      <div class="container">
        ${!this._editingSlot ? this._renderMainView() : this._renderEdit()}
      </div>
    `;
  }

  _renderMainView() {
    const locks = this._getNormalizedLocks();
    const canManage = this._canManagePins();

    const title = this.config?.title || "Entry Door Locks & Access";
    const subtitle = this.config?.subtitle || "Smart Lock Command Center";

    // Overall Lock Status Computation
    let anyUnlocked = false;
    let anyJammed = false;
    let totalLocks = locks.length;

    locks.forEach((lockDef) => {
      const lockObj = this._getEntity(lockDef.entity);
      const state = lockObj ? lockObj.state : "unknown";
      const jammedObj = lockDef.jammed ? this._getEntity(lockDef.jammed) : null;
      const isJammed =
        (jammedObj && jammedObj.state === "on") || state === "jammed";

      if (isJammed) anyJammed = true;
      if (state !== "locked") anyUnlocked = true;
    });

    const totalSlots = this.config?.slots || 10;
    const activeSlots = Object.keys(this.hass.states).filter(
      (k) =>
        k.startsWith("input_boolean.lock_code_enabled_") &&
        this.hass.states[k].state === "on"
    ).length;

    const showTimeline = this.config?.show_timeline !== false;

    return html`
      <div class="view fade-in">
        <!-- Main Card Header -->
        <div class="header">
          <div>
            <h1 class="title">${title}</h1>
            <p class="subtitle">${subtitle}</p>
          </div>

          <div class="header-right">
            ${totalLocks > 0
              ? html`
                  <div class="global-status">
                    ${anyJammed
                      ? html`<span class="status-pill jammed"
                          >${Icons.AlertTriangle} Lock Jammed</span
                        >`
                      : anyUnlocked
                      ? html`<span class="status-pill unlocked"
                          >${Icons.Unlock} Door Unlocked</span
                        >`
                      : html`<span class="status-pill locked"
                          >${Icons.Check} All Locked</span
                        >`}
                    ${anyUnlocked && this.config?.show_lock_all !== false
                      ? html`
                          <button
                            class="lock-all-btn"
                            @click=${() => this._lockAllDoors(locks)}
                            title="Lock all doors"
                          >
                            ${Icons.Lock} Lock All
                          </button>
                        `
                      : ""}
                  </div>
                `
              : canManage
              ? html`
                  <div style="text-align: right;">
                    <div class="stats-count">
                      ${activeSlots}<span class="divider">/</span>${totalSlots}
                    </div>
                    <div class="stats-label">Active</div>
                  </div>
                `
              : ""}
          </div>
        </div>

        <!-- 1. Live Door Controls Hero Section -->
        ${totalLocks > 0 ? this._renderDoorsSection(locks) : ""}

        <!-- 2. 24-Hour Timeline Bar & Collapsible Activity Feed -->
        ${showTimeline && totalLocks > 0 ? this._renderActivitySection(locks) : ""}

        <!-- 3. PIN Code & Access Management Section (Role Restricted) -->
        ${canManage ? this._renderSlotsSection(totalSlots, activeSlots) : ""}
      </div>
    `;
  }

  // --- DOORS HERO SECTION ---
  _renderDoorsSection(locks) {
    return html`
      <div class="doors-section">
        <div class="section-label">
          <span>Door Controls & Status</span>
        </div>
        <div class="doors-grid">
          ${locks.map((lockDef) => this._renderDoorCard(lockDef))}
        </div>
      </div>
    `;
  }

  _renderDoorCard(lockDef) {
    const lockEntity = lockDef.entity;
    const lockObj = this._getEntity(lockEntity);
    const state = lockObj ? lockObj.state : "unknown";
    const name =
      lockDef.name ||
      lockObj?.attributes?.friendly_name ||
      lockEntity.replace("lock.", "").replace(/_/g, " ");

    const isLocked = state === "locked";
    const isLocking = state === "locking";
    const isUnlocking = state === "unlocking";

    // Jammed Sensor Check
    const jammedObj = lockDef.jammed ? this._getEntity(lockDef.jammed) : null;
    const isJammed =
      (jammedObj && jammedObj.state === "on") || state === "jammed";

    // Battery Sensor Check
    const batteryObj = lockDef.battery
      ? this._getEntity(lockDef.battery)
      : null;
    const batteryState = batteryObj ? batteryObj.state : null;
    const batteryNum =
      batteryState !== null && !isNaN(Number(batteryState))
        ? Number(batteryState)
        : null;

    // Relative Time
    const relativeTime = lockObj?.last_changed
      ? this._formatRelativeTime(lockObj.last_changed)
      : "";

    return html`
      <div
        class="door-card ${isJammed
          ? "jammed"
          : isLocked
          ? "locked"
          : "unlocked"}"
      >
        ${isJammed
          ? html`
              <div class="jammed-alert-banner">
                ${Icons.AlertTriangle}
                <span>DEADBOLT JAMMED — CHECK DOOR</span>
              </div>
            `
          : ""}

        <div class="door-card-header">
          <div class="door-icon-wrapper ${isLocked ? "locked" : "unlocked"}">
            ${Icons.Door}
          </div>
          <div class="door-title-wrapper">
            <h3 class="door-name">${name}</h3>
            <span class="door-time">
              ${isLocking
                ? "Locking..."
                : isUnlocking
                ? "Unlocking..."
                : relativeTime
                ? `${isLocked ? "Locked" : "Unlocked"} ${relativeTime}`
                : isLocked
                ? "Locked"
                : "Unlocked"}
            </span>
          </div>

          ${batteryNum !== null
            ? html`
                <div
                  class="battery-pill ${batteryNum <= 20
                    ? "critical"
                    : batteryNum <= 50
                    ? "warning"
                    : "good"}"
                  title="Battery: ${batteryNum}%"
                >
                  ${Icons.Battery}
                  <span>${batteryNum}%</span>
                </div>
              `
            : ""}
        </div>

        <div class="door-action-row">
          <button
            class="door-toggle-btn ${isLocked ? "btn-locked" : "btn-unlocked"}"
            @click=${() => this._toggleLock(lockEntity, state)}
            ?disabled=${isLocking || isUnlocking}
          >
            <div class="btn-icon">${isLocked ? Icons.Lock : Icons.Unlock}</div>
            <div class="btn-text">
              <span class="btn-action-label"
                >${isLocked ? "Locked" : "Unlocked"}</span
              >
              <span class="btn-sub-label"
                >${isLocked ? "Tap to unlock" : "Tap to lock"}</span
              >
            </div>
          </button>
        </div>
      </div>
    `;
  }

  // --- ACTIVITY & TIMELINE SECTION ---
  _renderActivitySection(locks) {
    const hours = this.config?.timeline_hours || 24;
    const filter = this._selectedTimelineFilter || "all";
    const segments = this._calculateTimelineSegments();
    const axisTicks = this._getTimeAxisTicks(hours);
    const eventList = this._logbookEvents || [];
    const isExpanded = this._expandedRecentActivity;

    return html`
      <div class="activity-section">
        <div class="section-label-row">
          <div class="activity-title-group">
            <span class="activity-icon-header">${Icons.History}</span>
            <span class="section-label-text">
              ${hours}-Hour Activity Timeline
            </span>
          </div>

          <div class="timeline-header-actions">
            <button
              class="feed-refresh-btn ${this._isFetchingActivity
                ? "spinning"
                : ""}"
              @click=${() => this._fetchActivityData()}
              title="Refresh activity history"
            >
              ${Icons.RefreshCw}
            </button>

            <div class="timeline-filter-pills">
              <button
                class="filter-pill ${filter === "all" ? "active" : ""}"
                @click=${() => (this._selectedTimelineFilter = "all")}
              >
                All Doors
              </button>
              ${locks.map((l) => {
                const name =
                  l.name ||
                  this._getEntity(l.entity)?.attributes?.friendly_name ||
                  l.entity.replace("lock.", "").replace(/_/g, " ");
                return html`
                  <button
                    class="filter-pill ${filter === l.entity ? "active" : ""}"
                    @click=${() => (this._selectedTimelineFilter = l.entity)}
                  >
                    ${name}
                  </button>
                `;
              })}
            </div>
          </div>
        </div>

        <!-- 24h Continuous Segmented Bar -->
        <div class="timeline-bar-wrapper">
          <div class="timeline-bar">
            ${segments.map(
              (seg) => html`
                <div
                  class="timeline-segment ${seg.state}"
                  style="width: ${seg.pctWidth}%;"
                  @mouseenter=${() => (this._hoveredSegment = seg)}
                  @mouseleave=${() => (this._hoveredSegment = null)}
                  @click=${() => (this._hoveredSegment = seg)}
                ></div>
              `
            )}
          </div>

          <!-- Tooltip on hover / tap -->
          ${this._hoveredSegment
            ? html`
                <div class="timeline-tooltip fade-in">
                  <span
                    class="tooltip-dot ${this._hoveredSegment.state}"
                  ></span>
                  <span class="tooltip-state"
                    >${this._hoveredSegment.state.toUpperCase()}</span
                  >
                  <span class="tooltip-time"
                    >${this._hoveredSegment.timeRangeStr}</span
                  >
                  <span class="tooltip-duration"
                    >(${this._hoveredSegment.durationStr})</span
                  >
                </div>
              `
            : ""}

          <!-- Time Axis Ticks -->
          <div class="timeline-axis">
            ${axisTicks.map(
              (tick) => html`<span class="axis-tick">${tick}</span>`
            )}
          </div>
        </div>

        <!-- Collapsible Recent Activity Expander Bar (Div with role=button) -->
        <div
          class="activity-expand-bar ${isExpanded ? "open" : ""}"
          role="button"
          tabindex="0"
          @click=${() =>
            (this._expandedRecentActivity = !this._expandedRecentActivity)}
        >
          <div class="expand-bar-left">
            <span class="expand-chevron"
              >${isExpanded ? Icons.ChevronUp : Icons.ChevronDown}</span
            >
            <span>
              ${isExpanded
                ? "Hide Recent Activity Log"
                : `Show Recent Activity Log (${eventList.length} Events)`}
            </span>
          </div>
          <span class="expand-hint">
            ${isExpanded ? "Collapse" : "View"}
          </span>
        </div>

        <!-- Detailed Event List (Contained directly inside the Activity Section) -->
        ${isExpanded
          ? html`
              <div class="event-feed-container fade-in">
                ${eventList.length === 0
                  ? html`
                      <div class="empty-feed">
                        No lock activity recorded in the last ${hours} hours.
                      </div>
                    `
                  : html`
                      <div class="event-list-scrollable">
                        ${eventList.map(
                          (ev) => html`
                            <div class="event-row">
                              <div
                                class="event-icon-box ${ev.actionLabel.toLowerCase()}"
                              >
                                ${ev.isLocked
                                  ? Icons.Lock
                                  : ev.isJammed
                                  ? Icons.AlertTriangle
                                  : Icons.Unlock}
                              </div>

                              <div class="event-details">
                                <div class="event-top-line">
                                  <span class="event-door-badge"
                                    >${ev.doorName}</span
                                  >
                                  <span
                                    class="event-action ${ev.actionLabel.toLowerCase()}"
                                    >${ev.actionLabel}</span
                                  >
                                </div>
                                <div class="event-sub-line">
                                  <span class="event-actor">
                                    ${ev.sourceIcon === "pin"
                                      ? Icons.Key
                                      : ev.sourceIcon === "user"
                                      ? Icons.User
                                      : ev.sourceIcon === "automation"
                                      ? Icons.Clock
                                      : Icons.Door}
                                    ${ev.actor}
                                  </span>
                                </div>
                              </div>

                              <div class="event-time-box">
                                <span class="event-time-clock"
                                  >${ev.timeStr}</span
                                >
                                <span class="event-time-rel"
                                  >${ev.relativeTime}</span
                                >
                              </div>
                            </div>
                          `
                        )}
                      </div>
                    `}
              </div>
            `
          : ""}
      </div>
    `;
  }

  // --- SLOTS MANAGEMENT SECTION ---
  _renderSlotsSection(totalSlots, activeSlots) {
    const collapse = this.config?.collapse_inactive_slots !== false;

    const allSlotIndices = Array.from({ length: totalSlots }, (_, i) => i + 1);
    const activeSlotIndices = [];
    const inactiveSlotIndices = [];

    allSlotIndices.forEach((slot) => {
      const enabled =
        this._getState(`input_boolean.lock_code_enabled_${slot}`) === "on";
      const timer = this._getState(`timer.lock_code_timer_${slot}`, "idle");
      if (enabled || timer === "active") {
        activeSlotIndices.push(slot);
      } else {
        inactiveSlotIndices.push(slot);
      }
    });

    const displaySlots =
      !collapse || this._expandedInactive
        ? allSlotIndices
        : activeSlotIndices.length > 0
        ? activeSlotIndices
        : allSlotIndices;

    const hiddenCount = totalSlots - activeSlotIndices.length;

    return html`
      <div class="slots-section">
        <div class="section-label-row">
          <span class="section-label-text">PIN Code & Guest Access</span>
          <div class="slots-badge-counter">
            ${activeSlots}<span class="divider">/</span>${totalSlots} Active
          </div>
        </div>

        <div class="grid">
          ${displaySlots.map((slot, idx) =>
            this._renderSlotCard(slot, idx)
          )}
        </div>

        ${collapse && hiddenCount > 0 && activeSlotIndices.length > 0
          ? html`
              <button
                class="expand-toggle-btn"
                @click=${() =>
                  (this._expandedInactive = !this._expandedInactive)}
              >
                ${this._expandedInactive ? Icons.ChevronUp : Icons.ChevronDown}
                <span>
                  ${this._expandedInactive
                    ? "Hide Inactive & Empty Slots"
                    : `Show All Slots (${hiddenCount} Inactive / Empty)`}
                </span>
              </button>
            `
          : ""}
      </div>
    `;
  }

  _renderSlotCard(slot, index) {
    const name = this._getState(`input_text.lock_code_name_${slot}`);
    const pin = this._getState(`input_text.lock_code_pin_${slot}`);
    const enabled =
      this._getState(`input_boolean.lock_code_enabled_${slot}`) === "on";
    const guest = this._getState(
      `input_boolean.lock_guest_mode_enabled_${slot}`,
      "off"
    );
    const timer = this._getState(`timer.lock_code_timer_${slot}`, "idle");
    const isConfigured = (name && name.length > 0) || (pin && pin.length > 0);

    return html`
      <div
        class="slot-card ${enabled ? "enabled" : "disabled"}"
        style="animation-delay: ${index * 0.04}s"
        @click=${() => this._openEdit(slot)}
      >
        <div class="card-header">
          <div class="icon-box ${enabled ? "active" : ""}">
            ${enabled ? Icons.User : Icons.Lock}
          </div>
          <div class="slot-number">#${slot}</div>
        </div>

        <div class="card-body">
          <h3 class="card-title ${enabled || isConfigured ? "active" : ""}">
            ${name || "Empty Slot"}
          </h3>
          <p class="pin-text">${pin ? "••••" : "Not Set"}</p>
        </div>

        <div class="badge-container">
          ${!enabled
            ? html`<span class="badge offline"
                >${isConfigured ? "Disabled" : "Empty"}</span
              >`
            : html`
                <span class="badge success">Active</span>
                ${guest === "on"
                  ? html`<span class="badge warning">${Icons.User} Guest</span>`
                  : ""}
                ${timer === "active"
                  ? html`<span class="badge info">${Icons.Clock} Timer</span>`
                  : ""}
              `}
        </div>
      </div>
    `;
  }

  // --- EDIT MODAL VIEW ---
  _renderEdit() {
    const slot = this._editingSlot;

    const enabledEntId = `input_boolean.lock_code_enabled_${slot}`;
    const guestEntId = `input_boolean.lock_guest_mode_enabled_${slot}`;
    const durationEntId = `input_number.lock_code_duration_${slot}`;
    const timerActionEntId = `input_select.lock_timer_action_${slot}`;
    const timerStateEntId = `timer.lock_code_timer_${slot}`;
    const schedEnabledEntId = `input_boolean.lock_schedule_enabled_${slot}`;
    const schedStartEntId = `input_datetime.lock_schedule_start_time_${slot}`;
    const schedEndEntId = `input_datetime.lock_schedule_end_time_${slot}`;

    const isEnabled = this._getState(enabledEntId) === "on";
    const isGuest = this._getState(guestEntId) === "on";
    const isSchedEnabled = this._getState(schedEnabledEntId) === "on";
    const timerState = this._getState(timerStateEntId);

    const schedDaysStr = this._getState(
      `input_text.lock_schedule_days_${slot}`,
      "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
    );
    const selectedDays = schedDaysStr ? schedDaysStr.split(",") : [];

    const timerOpts =
      this._getEntity(timerActionEntId)?.attributes?.options || [];

    const scriptEntity =
      this.config?.manage_script || "script.manage_lock_codes";
    const [domain, service] = scriptEntity.split(".");

    return html`
      <div class="view fade-in">
        <div class="edit-header">
          <button class="back-button" @click=${this._closeEdit}>
            ${Icons.ArrowLeft} Back
          </button>
          <div class="edit-header-right">
            <div class="icon-box active circle">${slot}</div>
            <div style="text-align: right">
              <h2 class="edit-title">Slot ${slot}</h2>
              <span class="edit-status ${isEnabled ? "success" : ""}">
                ${isEnabled ? "Active" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        <div class="edit-body">
          <!-- Name Input -->
          <div class="input-group">
            <label class="input-label">Name</label>
            <div class="input-wrapper">
              <div class="icon-absolute">${Icons.User}</div>
              <input
                class="custom-input"
                .value=${this._localName}
                @input=${(e) => (this._localName = e.target.value)}
                placeholder="Name this code"
              />
            </div>
          </div>

          <!-- PIN Input -->
          <div class="input-group">
            <label class="input-label">PIN Code</label>
            <div style="display: flex; gap: 12px; align-items: center;">
              <div class="input-wrapper" style="flex: 1;">
                <div class="icon-absolute">${Icons.Key}</div>
                <input
                  class="custom-input pin-input"
                  .value=${this._localPin}
                  @input=${(e) => (this._localPin = e.target.value)}
                  placeholder="••••"
                />
              </div>
              <button class="icon-button" @click=${this._handleGenerate}>
                ${Icons.RefreshCw}
              </button>
            </div>
          </div>

          <!-- Settings Toggles -->
          <div class="settings-list">
            <div
              class="toggle-row"
              @click=${() => this._toggleBoolean(enabledEntId)}
            >
              <div class="toggle-info">
                <div
                  style="color: ${isEnabled
                    ? "var(--primary-color)"
                    : "var(--secondary-text-color)"}"
                >
                  ${isEnabled ? Icons.Unlock : Icons.Lock}
                </div>
                <div>
                  <div class="toggle-title">Enable Slot</div>
                  <div class="toggle-desc">Allow this code to operate lock</div>
                </div>
              </div>
              <div class="toggle-switch ${isEnabled ? "active" : ""}">
                <div class="toggle-knob ${isEnabled ? "active" : ""}"></div>
              </div>
            </div>

            <div
              class="toggle-row no-border"
              @click=${() => this._toggleBoolean(guestEntId)}
            >
              <div class="toggle-info">
                <div
                  style="color: ${isGuest
                    ? "var(--warning-color, #ff9800)"
                    : "var(--secondary-text-color)"}"
                >
                  ${Icons.ShieldAlert}
                </div>
                <div>
                  <div class="toggle-title">Guest Mode</div>
                  <div class="toggle-desc">
                    Turns on "Guest Mode" when code is used
                  </div>
                </div>
              </div>
              <div class="toggle-switch ${isGuest ? "active" : ""}">
                <div class="toggle-knob ${isGuest ? "active" : ""}"></div>
              </div>
            </div>
          </div>

          <!-- Timer Section -->
          ${this._renderSection(
            "timer",
            "Timer",
            Icons.ClockLg,
            html`
              <div class="inline-grid">
                <div class="input-group">
                  <label class="input-label">Duration (Hours)</label>
                  <input
                    type="number"
                    class="custom-input"
                    .value=${this._getState(durationEntId)}
                    @change=${(e) =>
                      this._callService("input_number", "set_value", {
                        entity_id: durationEntId,
                        value: e.target.value,
                      })}
                  />
                </div>
                <div class="input-group">
                  <label class="input-label">Action</label>
                  <select
                    class="custom-select"
                    .value=${this._getState(timerActionEntId)}
                    @change=${(e) =>
                      this._callService("input_select", "select_option", {
                        entity_id: timerActionEntId,
                        option: e.target.value,
                      })}
                  >
                    ${timerOpts.map(
                      (opt) => html`<option value="${opt}">${opt}</option>`
                    )}
                  </select>
                </div>
              </div>
              <button
                class="button-outline"
                style="margin-top: 16px;"
                @click=${() =>
                  this._callService(
                    domain || "script",
                    service || "manage_lock_codes",
                    {
                      action: "set_timed",
                      code_slot: slot.toString(),
                    }
                  )}
              >
                ${Icons.Play}
                <span style="margin-left:8px"
                  >${timerState === "active"
                    ? "Timer Active"
                    : "Start Timer"}</span
                >
              </button>
            `
          )}

          <!-- Schedule Section -->
          ${this._renderSection(
            "schedule",
            "Schedule",
            Icons.Calendar,
            html`
              <div
                class="toggle-row no-border no-pad"
                @click=${() => this._toggleBoolean(schedEnabledEntId)}
              >
                <div class="toggle-title">Enable Schedule</div>
                <div class="toggle-switch ${isSchedEnabled ? "active" : ""}">
                  <div
                    class="toggle-knob ${isSchedEnabled ? "active" : ""}"
                  ></div>
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">Active Days</label>
                <div
                  class="day-chips"
                  style="opacity: ${isSchedEnabled ? "1" : "0.5"}"
                >
                  ${this._fullDaysList.map((day, idx) => {
                    const isSel = selectedDays.includes(day);
                    return html`
                      <div
                        class="day-chip ${isSel ? "selected" : ""}"
                        @click=${() => this._toggleDay(day)}
                      >
                        ${this._shortDaysList[idx]}
                      </div>
                    `;
                  })}
                </div>
              </div>

              <div class="inline-grid">
                <div class="input-group">
                  <label class="input-label">Start Time</label>
                  <input
                    type="time"
                    class="custom-input time-input"
                    .value=${this._getState(schedStartEntId).slice(0, 5)}
                    @change=${(e) =>
                      this._callService("input_datetime", "set_datetime", {
                        entity_id: schedStartEntId,
                        time: e.target.value,
                      })}
                    ?disabled=${!isSchedEnabled}
                  />
                </div>
                <div class="input-group">
                  <label class="input-label">End Time</label>
                  <input
                    type="time"
                    class="custom-input time-input"
                    .value=${this._getState(schedEndEntId).slice(0, 5)}
                    @change=${(e) =>
                      this._callService("input_datetime", "set_datetime", {
                        entity_id: schedEndEntId,
                        time: e.target.value,
                      })}
                    ?disabled=${!isSchedEnabled}
                  />
                </div>
              </div>
            `
          )}
        </div>

        <div class="footer-actions">
          <button class="button-danger" @click=${this._handleClear}>
            ${Icons.Trash2} Delete
          </button>
          <button class="button-primary" @click=${this._handleSave}>
            ${Icons.Save} Save
          </button>
        </div>
      </div>
    `;
  }

  _renderSection(key, title, icon, content) {
    const isOpen = this._openSections[key] || false;
    return html`
      <div class="section">
        <div
          class="section-header ${isOpen ? "open" : ""}"
          @click=${() => this._toggleSection(key)}
        >
          <div class="section-title">
            <span style="color: var(--primary-color)">${icon}</span>
            ${title}
          </div>
          <div
            class="section-chevron"
            style="transform: rotate(${isOpen ? "180deg" : "0deg"})"
          >
            ${Icons.ChevronDown}
          </div>
        </div>
        <div
          class="section-content-wrapper"
          style="max-height: ${isOpen ? "500px" : "0px"}; opacity: ${isOpen
            ? "1"
            : "0"}"
        >
          <div class="section-content">${content}</div>
        </div>
      </div>
    `;
  }

  // --- STYLES ---
  static get styles() {
    return css`
      :host {
        display: block;
      }
      .loading {
        color: var(--primary-text-color);
        padding: 20px;
      }
      .container {
        font-family: Roboto, "Segoe UI", sans-serif;
        background-color: var(
          --ha-card-background,
          var(--card-background-color, #fff)
        );
        color: var(--primary-text-color, #212121);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(
          --ha-card-box-shadow,
          0 2px 2px 0 rgba(0, 0, 0, 0.14),
          0 1px 5px 0 rgba(0, 0, 0, 0.12),
          0 3px 1px -2px rgba(0, 0, 0, 0.2)
        );
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
        position: relative;
        min-height: 280px;
        transition: height 0.3s ease;
      }
      .view {
        padding: 16px;
        width: 100%;
        box-sizing: border-box;
      }
      .fade-in {
        animation: fadeIn 0.3s ease-out;
      }

      /* Header */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding-bottom: 16px;
      }
      .title {
        font-size: 22px;
        font-weight: 600;
        margin: 0;
        letter-spacing: -0.01em;
      }
      .subtitle {
        color: var(--secondary-text-color, #757575);
        font-size: 13px;
        margin-top: 4px;
        margin-bottom: 0;
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .global-status {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .status-pill {
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        gap: 6px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .status-pill.locked {
        background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.15);
        color: var(--success-color, #4caf50);
        border: 1px solid rgba(var(--rgb-success-color, 76, 175, 80), 0.3);
      }
      .status-pill.unlocked {
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15);
        color: var(--warning-color, #ff9800);
        border: 1px solid rgba(var(--rgb-warning-color, 255, 152, 0), 0.3);
      }
      .status-pill.jammed {
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.2);
        color: var(--error-color, #f44336);
        border: 1px solid rgba(var(--rgb-error-color, 244, 67, 54), 0.5);
        animation: pulseWarning 1.5s infinite;
      }
      .lock-all-btn {
        background-color: var(--primary-color, #2196f3);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: 16px;
        padding: 4px 12px;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      .lock-all-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      /* Doors Hero Section */
      .doors-section {
        margin-bottom: 24px;
      }
      .section-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--secondary-text-color, #757575);
        margin-bottom: 12px;
      }
      .doors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 12px;
      }
      .door-card {
        background-color: var(
          --secondary-background-color,
          rgba(255, 255, 255, 0.05)
        );
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        transition: all 0.25s ease;
        position: relative;
        overflow: hidden;
      }
      .door-card.locked {
        border-left: 4px solid var(--success-color, #4caf50);
      }
      .door-card.unlocked {
        border-left: 4px solid var(--warning-color, #ff9800);
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.04);
      }
      .door-card.jammed {
        border-left: 4px solid var(--error-color, #f44336);
        border-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.5);
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.08);
      }
      .jammed-alert-banner {
        background-color: var(--error-color, #f44336);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
        letter-spacing: 0.05em;
        animation: pulseWarning 1.5s infinite;
      }
      .door-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .door-icon-wrapper {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--secondary-background-color, #eee);
        color: var(--secondary-text-color, #757575);
      }
      .door-icon-wrapper.locked {
        background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.15);
        color: var(--success-color, #4caf50);
      }
      .door-icon-wrapper.unlocked {
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15);
        color: var(--warning-color, #ff9800);
      }
      .door-title-wrapper {
        flex: 1;
        min-width: 0;
      }
      .door-name {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .door-time {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
        margin-top: 2px;
        display: block;
      }
      .battery-pill {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 12px;
        background-color: var(--secondary-background-color, #eee);
      }
      .battery-pill.good {
        color: var(--success-color, #4caf50);
        background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.12);
      }
      .battery-pill.warning {
        color: var(--warning-color, #ff9800);
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.12);
      }
      .battery-pill.critical {
        color: var(--error-color, #f44336);
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.15);
        animation: pulseWarning 1.5s infinite;
      }

      .door-action-row {
        display: flex;
      }
      .door-toggle-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        border-radius: 10px;
        border: 1px solid var(--divider-color, #e0e0e0);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: left;
        background-color: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      .door-toggle-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
      }
      .door-toggle-btn.btn-locked {
        border-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.4);
      }
      .door-toggle-btn.btn-locked .btn-icon {
        color: var(--success-color, #4caf50);
        background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.12);
      }
      .door-toggle-btn.btn-unlocked {
        border-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.4);
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.06);
      }
      .door-toggle-btn.btn-unlocked .btn-icon {
        color: var(--warning-color, #ff9800);
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15);
      }
      .btn-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .btn-text {
        display: flex;
        flex-direction: column;
      }
      .btn-action-label {
        font-size: 14px;
        font-weight: 600;
      }
      .btn-sub-label {
        font-size: 11px;
        color: var(--secondary-text-color, #757575);
      }

      /* 24-Hour Activity & Timeline Section */
      .activity-section {
        margin-bottom: 24px;
        background-color: var(
          --secondary-background-color,
          rgba(255, 255, 255, 0.03)
        );
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 16px;
      }
      .activity-title-group {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .activity-icon-header {
        display: flex;
        align-items: center;
        color: var(--primary-color, #2196f3);
      }
      .timeline-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .feed-refresh-btn {
        background: transparent;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.15));
        color: var(--secondary-text-color, #757575);
        cursor: pointer;
        padding: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s;
      }
      .feed-refresh-btn:hover {
        color: var(--primary-color, #2196f3);
        border-color: var(--primary-color, #2196f3);
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
      }
      .feed-refresh-btn.spinning {
        animation: spin 1s linear infinite;
      }
      .timeline-filter-pills {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .filter-pill {
        background-color: transparent;
        border: 1px solid var(--divider-color, #e0e0e0);
        color: var(--secondary-text-color, #757575);
        border-radius: 12px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .filter-pill:hover {
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
      }
      .filter-pill.active {
        background-color: var(--primary-color, #2196f3);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color, #2196f3);
      }

      .timeline-bar-wrapper {
        margin-top: 14px;
        position: relative;
      }
      .timeline-bar {
        height: 20px;
        width: 100%;
        border-radius: 6px;
        overflow: hidden;
        display: flex;
        background-color: var(--divider-color, #e0e0e0);
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
      }
      .timeline-segment {
        height: 100%;
        transition: transform 0.15s ease, filter 0.15s ease;
        cursor: pointer;
        min-width: 2px;
      }
      .timeline-segment:hover {
        filter: brightness(1.2);
        transform: scaleY(1.15);
        z-index: 2;
      }
      .timeline-segment.locked {
        background-color: var(--success-color, #4caf50);
      }
      .timeline-segment.unlocked {
        background-color: var(--warning-color, #ff9800);
      }
      .timeline-segment.jammed {
        background-color: var(--error-color, #f44336);
      }

      .timeline-tooltip {
        margin-top: 8px;
        padding: 6px 12px;
        background-color: var(--card-background-color, #212121);
        color: var(--primary-text-color, #fff);
        border: 1px solid var(--divider-color, #424242);
        border-radius: 20px;
        font-size: 11px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      }
      .tooltip-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .tooltip-dot.locked {
        background-color: var(--success-color, #4caf50);
      }
      .tooltip-dot.unlocked {
        background-color: var(--warning-color, #ff9800);
      }
      .tooltip-dot.jammed {
        background-color: var(--error-color, #f44336);
      }
      .tooltip-state {
        font-weight: 700;
        letter-spacing: 0.04em;
      }
      .tooltip-time {
        font-weight: 500;
      }
      .tooltip-duration {
        color: var(--secondary-text-color, #9e9e9e);
      }

      .timeline-axis {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        color: var(--secondary-text-color, #757575);
        margin-top: 6px;
      }

      /* Collapsible Recent Activity Expander Bar */
      .activity-expand-bar {
        margin-top: 14px;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
        background-color: rgba(255, 255, 255, 0.02);
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
      }
      .activity-expand-bar:hover {
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
        border-color: var(--primary-color, #2196f3);
      }
      .activity-expand-bar.open {
        border-color: var(--primary-color, #2196f3);
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.05);
      }
      .expand-bar-left {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .expand-chevron {
        color: var(--primary-color, #2196f3);
        display: flex;
        align-items: center;
      }
      .expand-hint {
        font-size: 11px;
        color: var(--secondary-text-color, #757575);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Detailed Event Feed Container (Inside Activity Section) */
      .event-feed-container {
        margin-top: 12px;
        border-top: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
        padding-top: 12px;
      }
      .event-list-scrollable {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 380px;
        overflow-y: auto;
        padding-right: 4px;
      }
      .event-list-scrollable::-webkit-scrollbar {
        width: 4px;
      }
      .event-list-scrollable::-webkit-scrollbar-track {
        background: transparent;
      }
      .event-list-scrollable::-webkit-scrollbar-thumb {
        background-color: var(--divider-color, rgba(255, 255, 255, 0.2));
        border-radius: 4px;
      }
      .event-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.06));
        transition: all 0.2s;
      }
      .event-row:hover {
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.04);
        border-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.2);
      }
      .event-icon-box {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .event-icon-box.locked {
        background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.15);
        color: var(--success-color, #4caf50);
      }
      .event-icon-box.unlocked {
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15);
        color: var(--warning-color, #ff9800);
      }
      .event-icon-box.jammed {
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.2);
        color: var(--error-color, #f44336);
      }
      .event-details {
        flex: 1;
        min-width: 0;
      }
      .event-top-line {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 2px;
      }
      .event-door-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        background-color: var(--secondary-background-color, #eee);
        color: var(--primary-text-color);
      }
      .event-action {
        font-size: 13px;
        font-weight: 600;
      }
      .event-action.locked {
        color: var(--success-color, #4caf50);
      }
      .event-action.unlocked {
        color: var(--warning-color, #ff9800);
      }
      .event-action.jammed {
        color: var(--error-color, #f44336);
      }
      .event-sub-line {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .event-actor {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .event-time-box {
        text-align: right;
        flex-shrink: 0;
      }
      .event-time-clock {
        font-size: 12px;
        font-weight: 600;
        display: block;
      }
      .event-time-rel {
        font-size: 10px;
        color: var(--secondary-text-color, #757575);
        display: block;
        margin-top: 2px;
      }
      .empty-feed {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
        font-style: italic;
        padding: 8px 0;
        text-align: center;
      }

      /* Slots Section */
      .slots-section {
        margin-top: 12px;
      }
      .section-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .section-label-text {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--secondary-text-color, #757575);
      }
      .slots-badge-counter {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color, #757575);
      }
      .slots-badge-counter .divider {
        margin: 0 2px;
      }
      .expand-toggle-btn {
        width: 100%;
        margin-top: 12px;
        padding: 10px;
        border-radius: 8px;
        border: 1px dashed var(--divider-color, #bdbdbd);
        background-color: transparent;
        color: var(--primary-color, #2196f3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
      }
      .expand-toggle-btn:hover {
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.06);
        border-color: var(--primary-color, #2196f3);
      }

      /* Slot Grid */
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
      }
      .slot-card {
        border-radius: var(--ha-card-border-radius, 8px);
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        animation: slideUp 0.3s cubic-bezier(0, 0, 0.2, 1) forwards;
        display: flex;
        flex-direction: column;
        min-height: 130px;
        position: relative;
        transform: scale(1);
      }
      .slot-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .slot-card.enabled {
        background-color: var(--secondary-background-color, #f5f5f5);
        border: 1px solid var(--divider-color, #e0e0e0);
      }
      .slot-card.enabled:hover {
        border-color: var(--primary-color, #2196f3);
      }
      .slot-card.disabled {
        background-color: transparent;
        border: 1px dashed var(--divider-color, #bdbdbd);
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }
      .icon-box {
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
        background-color: var(--secondary-background-color, #eee);
        color: var(--disabled-text-color, #bdbdbd);
      }
      .icon-box.active {
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1);
        color: var(--primary-color, #2196f3);
      }
      .icon-box.circle {
        border-radius: 50%;
        width: 32px;
        height: 32px;
        padding: 0;
      }
      .slot-number {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color, #757575);
      }
      .card-body {
        margin-bottom: 16px;
      }
      .card-title {
        font-weight: 500;
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0 0 4px 0;
        color: var(--disabled-text-color, #9e9e9e);
      }
      .card-title.active {
        color: var(--primary-text-color, #212121);
      }
      .pin-text {
        font-size: 14px;
        color: var(--secondary-text-color, #757575);
        font-family: monospace;
        margin: 0;
        letter-spacing: 1px;
      }
      .badge-container {
        display: flex;
        gap: 4px;
        margin-top: auto;
        flex-wrap: wrap;
      }
      .badge {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .badge svg {
        margin-right: 4px;
      }
      .badge.offline {
        background-color: rgba(0, 0, 0, 0.05);
        color: var(--disabled-text-color, #9e9e9e);
      }
      .badge.success {
        background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.15);
        color: var(--success-color, #4caf50);
      }
      .badge.warning {
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15);
        color: var(--warning-color, #ff9800);
      }
      .badge.info {
        background-color: rgba(var(--rgb-info-color, 33, 150, 243), 0.15);
        color: var(--info-color, #2196f3);
      }

      /* Edit View Styles */
      .edit-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .back-button {
        display: flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        padding: 8px 8px 8px 0;
        transition: opacity 0.2s;
      }
      .back-button:hover {
        opacity: 0.7;
      }
      .edit-header-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .edit-title {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      .edit-status {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .edit-status.success {
        color: var(--success-color, #4caf50);
      }
      .edit-body {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .input-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .input-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-color, #2196f3);
        margin-left: 4px;
      }
      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }
      .icon-absolute {
        position: absolute;
        left: 12px;
        color: var(--secondary-text-color, #757575);
        display: flex;
        z-index: 1;
      }
      .custom-input {
        width: 100%;
        background-color: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color, #212121);
        border: 1px solid var(--divider-color, #bdbdbd);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 16px 16px 16px 44px;
        font-size: 16px;
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.2s, background-color 0.2s;
      }
      .custom-input:focus {
        border-color: var(--primary-color, #2196f3);
        background-color: var(--card-background-color, #fff);
      }
      .pin-input {
        font-family: monospace;
        letter-spacing: 2px;
      }
      .icon-button {
        background: transparent;
        border: 1px solid var(--divider-color);
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s;
      }
      .icon-button:hover {
        background-color: var(--secondary-background-color);
        color: var(--primary-color);
      }
      .custom-select {
        width: 100%;
        background-color: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color, #212121);
        border: 1px solid var(--divider-color, #bdbdbd);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 16px;
        font-size: 16px;
        outline: none;
        appearance: none;
        box-sizing: border-box;
        background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22gray%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
        background-repeat: no-repeat;
        background-position: right 12px top 50%;
        background-size: 10px;
      }
      .toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: var(--card-background-color, #fff);
        cursor: pointer;
        border-bottom: 1px solid var(--divider-color, #eee);
        transition: background-color 0.2s;
      }
      .toggle-row.no-border {
        border-bottom: none;
      }
      .toggle-row.no-pad {
        padding-left: 0;
        padding-right: 0;
      }
      .toggle-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .toggle-title {
        font-size: 16px;
        color: var(--primary-text-color);
      }
      .toggle-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .toggle-switch {
        width: 52px;
        height: 32px;
        background-color: var(--switch-unchecked-track-color, #e7e0ec);
        border: 2px solid var(--switch-unchecked-button-color, #79747e);
        border-radius: 16px;
        position: relative;
        transition: background-color 0.2s ease, border-color 0.2s ease;
        box-sizing: border-box;
      }
      .toggle-switch.active {
        background-color: var(
          --switch-checked-track-color,
          var(--primary-color, #6750a4)
        );
        border-color: var(
          --switch-checked-track-color,
          var(--primary-color, #6750a4)
        );
      }
      .toggle-knob {
        width: 16px;
        height: 16px;
        background-color: var(--switch-unchecked-button-color, #79747e);
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 6px;
        transform: translateY(-50%);
        transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
      }
      .toggle-knob.active {
        width: 24px;
        height: 24px;
        background-color: var(--switch-checked-button-color, #ffffff);
        left: calc(100% - 24px - 2px);
      }

      .section {
        background-color: var(--card-background-color, #fff);
        border-radius: var(--ha-card-border-radius, 12px);
        border: 1px solid var(--divider-color, #e0e0e0);
        overflow: hidden;
        margin-top: 8px;
      }
      .section-header {
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        background-color: var(--secondary-background-color, #fafafa);
        border-bottom: 1px solid transparent;
      }
      .section-header:hover {
        background-color: var(--secondary-background-color, #eee);
      }
      .section-header.open {
        border-bottom-color: var(--divider-color, #e0e0e0);
      }
      .section-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .section-chevron {
        color: var(--secondary-text-color);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .section-content-wrapper {
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .section-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .inline-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .time-input {
        padding-left: 16px;
      }

      .day-chips {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }
      .day-chip {
        flex: 1;
        aspect-ratio: 1;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        background-color: var(--secondary-background-color, #f5f5f5);
        color: var(--secondary-text-color, #757575);
        border: 1px solid var(--divider-color, #bdbdbd);
        transition: all 0.2s;
      }
      .day-chip.selected {
        background-color: var(--primary-color, #2196f3);
        color: var(--on-primary-color, #fff);
        border-color: var(--primary-color, #2196f3);
      }

      .footer-actions {
        padding: 24px 0;
        display: flex;
        gap: 16px;
      }
      .button-primary,
      .button-danger,
      .button-outline {
        padding: 10px 24px;
        border-radius: 24px;
        font-weight: 500;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        flex: 1;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.2s;
      }
      .button-primary {
        background-color: var(--primary-color, #2196f3);
        color: var(--text-primary-color, #fff);
        border: none;
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
          0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);
      }
      .button-primary:hover {
        box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
          0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
      }
      .button-danger {
        background-color: transparent;
        color: var(--error-color, #f44336);
        border: 1px solid var(--error-color, #f44336);
      }
      .button-danger:hover {
        background-color: rgba(var(--rgb-error-color), 0.1);
      }
      .button-outline {
        background-color: transparent;
        color: var(--primary-color);
        border: 1px solid var(--divider-color);
      }
      .button-outline:hover {
        background-color: rgba(var(--rgb-primary-color), 0.1);
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes pulseWarning {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(0.98);
        }
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `;
  }
}

// --- VISUAL EDITOR ---
class PassableLockManagerCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _expandedSections: { state: true },
    _expandedLocks: { state: true },
    _users: { state: true },
  };

  constructor() {
    super();
    this._expandedSections = {
      header: true,
      doors: true,
      timeline: true,
      security: false,
      slots: false,
    };
    this._expandedLocks = {};
    this._users = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchUsers();
  }

  async _fetchUsers() {
    if (this.hass && this.hass.user && this.hass.user.is_admin) {
      try {
        const users = await this.hass.connection.sendMessagePromise({
          type: "config/auth/list",
        });
        this._users = users.map((u) => ({ label: u.name, value: u.id }));
        this.requestUpdate();
      } catch (e) {
        console.error("Failed to fetch users", e);
      }
    }
  }

  setConfig(config) {
    this._config = config;
  }

  _fireConfigChange() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _toggleSection(section, ev) {
    if (ev) ev.stopPropagation();
    this._expandedSections = {
      ...this._expandedSections,
      [section]: !this._expandedSections[section],
    };
    this.requestUpdate();
  }

  _toggleLockItem(index, ev) {
    if (ev) ev.stopPropagation();
    this._expandedLocks = {
      ...this._expandedLocks,
      [index]: !this._expandedLocks[index],
    };
    this.requestUpdate();
  }

  _updateConfigValue(key, value) {
    if (!this._config) return;
    const newConfig = { ...this._config };
    if (value === undefined || value === "" || value === null) {
      delete newConfig[key];
    } else {
      newConfig[key] = value;
    }
    this._config = newConfig;
    this._fireConfigChange();
  }

  _addLock(ev) {
    if (ev) {
      ev.stopPropagation();
      ev.preventDefault();
    }
    const currentLocks = this._config?.locks ? [...this._config.locks] : [];
    const newLock = { entity: "", name: "", battery: "", jammed: "" };
    currentLocks.push(newLock);
    this._config = { ...this._config, locks: currentLocks };
    this._expandedLocks = {
      ...this._expandedLocks,
      [currentLocks.length - 1]: true,
    };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _removeLock(index, ev) {
    if (ev) {
      ev.stopPropagation();
      ev.preventDefault();
    }
    const currentLocks = this._config?.locks ? [...this._config.locks] : [];
    currentLocks.splice(index, 1);
    this._config = { ...this._config, locks: currentLocks };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _updateLockField(index, field, value) {
    const currentLocks = this._config?.locks ? [...this._config.locks] : [];
    let lockObj = currentLocks[index];
    if (typeof lockObj === "string") {
      lockObj = { entity: lockObj };
    }
    lockObj = { ...lockObj };
    if (value === undefined || value === "" || value === null) {
      delete lockObj[field];
    } else {
      lockObj[field] = value;
    }
    currentLocks[index] = lockObj;
    this._config = { ...this._config, locks: currentLocks };
    this.requestUpdate();
    this._fireConfigChange();
  }

  static get styles() {
    return css`
      :host {
        display: block;
        box-sizing: border-box;
        width: 100%;
      }
      .editor-container {
        padding: 4px 0;
        color: var(--primary-text-color);
        display: flex;
        flex-direction: column;
        gap: 16px;
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
      }
      .editor-section {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        overflow: hidden;
        background-color: var(--card-background-color, #fff);
        box-sizing: border-box;
        width: 100%;
      }
      .editor-section-header {
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
        background-color: var(--secondary-background-color, #f5f5f5);
        border-bottom: 1px solid transparent;
        box-sizing: border-box;
      }
      .editor-section-header.open {
        border-bottom-color: var(--divider-color, #e0e0e0);
      }
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
      }
      .section-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        box-sizing: border-box;
        width: 100%;
      }
      .lock-item-card {
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        background-color: var(--secondary-background-color, #fafafa);
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
      }
      .lock-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
      }
      .lock-item-title {
        font-weight: 600;
        font-size: 13px;
      }
      .lock-item-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .delete-btn {
        cursor: pointer;
        color: var(--error-color, #f44336);
        padding: 4px;
      }
      .add-button {
        display: flex;
        align-items: center;
        gap: 6px;
        background-color: transparent;
        color: var(--primary-color, #2196f3);
        border: 1px dashed var(--primary-color, #2196f3);
        border-radius: 8px;
        padding: 10px;
        width: 100%;
        cursor: pointer;
        justify-content: center;
        font-weight: 600;
        font-size: 13px;
        transition: background-color 0.2s;
        box-sizing: border-box;
      }
      .add-button:hover {
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
      }
      .help-text {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
        margin: 0;
      }
      ha-selector {
        width: 100%;
        box-sizing: border-box;
      }
    `;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const locks = this._config.locks || [];

    const renderHeader = (id, title, extraBtn) => html`
      <div
        class="editor-section-header ${this._expandedSections[id] ? "open" : ""}"
        @click=${(ev) => this._toggleSection(id, ev)}
      >
        <div class="section-title">
          <ha-icon
            icon="${this._expandedSections[id]
              ? "mdi:chevron-down"
              : "mdi:chevron-right"}"
          ></ha-icon>
          <span>${title}</span>
        </div>
        ${extraBtn || ""}
      </div>
    `;

    return html`
      <div class="editor-container">
        <!-- 1. CARD HEADER SETTINGS -->
        <div class="editor-section">
          ${renderHeader("header", "Card Header & Info")}
          <div
            class="section-body"
            style="display: ${this._expandedSections.header
              ? "flex"
              : "none"};"
          >
            <ha-selector
              .hass=${this.hass}
              .selector=${{ text: {} }}
              .value=${this._config.title || "Entry Door Locks & Access"}
              .label=${"Card Title"}
              @value-changed=${(e) =>
                this._updateConfigValue("title", e.detail.value)}
            ></ha-selector>

            <ha-selector
              .hass=${this.hass}
              .selector=${{ text: {} }}
              .value=${this._config.subtitle || "Smart Lock Command Center"}
              .label=${"Card Subtitle"}
              @value-changed=${(e) =>
                this._updateConfigValue("subtitle", e.detail.value)}
            ></ha-selector>
          </div>
        </div>

        <!-- 2. DOOR LOCKS & DIAGNOSTICS -->
        <div class="editor-section">
          ${renderHeader(
            "doors",
            `Door Locks & Controls (${locks.length})`
          )}
          <div
            class="section-body"
            style="display: ${this._expandedSections.doors ? "flex" : "none"};"
          >
            <ha-selector
              .hass=${this.hass}
              .selector=${{ boolean: {} }}
              .value=${this._config.show_lock_all !== false}
              .label=${"Show 'Lock All' Quick Action Button"}
              @value-changed=${(e) =>
                this._updateConfigValue("show_lock_all", e.detail.value)}
            ></ha-selector>

            <p class="help-text">
              Configure smart lock entities and optional battery/jammed diagnostics sensors.
            </p>

            ${locks.map((lockItem, index) => {
              const lockObj =
                typeof lockItem === "string" ? { entity: lockItem } : lockItem;
              const isExp = this._expandedLocks[index] !== false;
              const lockTitle =
                lockObj.name ||
                lockObj.entity ||
                `Door Lock ${index + 1}`;

              return html`
                <div class="lock-item-card">
                  <div
                    class="lock-item-header"
                    @click=${(ev) => this._toggleLockItem(index, ev)}
                  >
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <ha-icon
                        icon="${isExp
                          ? "mdi:chevron-down"
                          : "mdi:chevron-right"}"
                      ></ha-icon>
                      <span class="lock-item-title">${lockTitle}</span>
                    </div>
                    <div
                      class="lock-item-actions"
                      @click=${(e) => e.stopPropagation()}
                    >
                      <ha-icon
                        class="delete-btn"
                        icon="mdi:delete"
                        @click=${(ev) => this._removeLock(index, ev)}
                        title="Remove door lock"
                      ></ha-icon>
                    </div>
                  </div>

                  <div
                    style="display: ${isExp
                      ? "flex"
                      : "none"}; flex-direction: column; gap: 12px; margin-top: 12px;"
                  >
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: "lock" } }}
                      .value=${lockObj.entity || ""}
                      .label=${"Lock Entity (Required)"}
                      @value-changed=${(e) =>
                        this._updateLockField(index, "entity", e.detail.value)}
                    ></ha-selector>

                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ text: {} }}
                      .value=${lockObj.name || ""}
                      .label=${"Custom Name (Optional)"}
                      @value-changed=${(e) =>
                        this._updateLockField(index, "name", e.detail.value)}
                    ></ha-selector>

                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: "sensor" } }}
                      .value=${lockObj.battery || ""}
                      .label=${"Battery Sensor (Optional)"}
                      @value-changed=${(e) =>
                        this._updateLockField(
                          index,
                          "battery",
                          e.detail.value
                        )}
                    ></ha-selector>

                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: "binary_sensor" } }}
                      .value=${lockObj.jammed || ""}
                      .label=${"Jammed Sensor (Optional)"}
                      @value-changed=${(e) =>
                        this._updateLockField(index, "jammed", e.detail.value)}
                    ></ha-selector>
                  </div>
                </div>
              `;
            })}

            <button class="add-button" @click=${(ev) => this._addLock(ev)}>
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>Add Door Lock</span>
            </button>
          </div>
        </div>

        <!-- 3. ACTIVITY TIMELINE & HISTORY -->
        <div class="editor-section">
          ${renderHeader("timeline", "Activity Timeline & History Feed")}
          <div
            class="section-body"
            style="display: ${this._expandedSections.timeline
              ? "flex"
              : "none"};"
          >
            <ha-selector
              .hass=${this.hass}
              .selector=${{ boolean: {} }}
              .value=${this._config.show_timeline !== false}
              .label=${"Show 24-Hour Activity Timeline Bar"}
              @value-changed=${(e) =>
                this._updateConfigValue("show_timeline", e.detail.value)}
            ></ha-selector>

            <ha-selector
              .hass=${this.hass}
              .selector=${{ boolean: {} }}
              .value=${this._config.default_expand_activity || false}
              .label=${"Expand Activity Log Details by Default"}
              @value-changed=${(e) =>
                this._updateConfigValue("default_expand_activity", e.detail.value)}
            ></ha-selector>

            <ha-selector
              .hass=${this.hass}
              .selector=${{ number: { min: 6, max: 72, step: 6, mode: "box" } }}
              .value=${this._config.timeline_hours !== undefined
                ? this._config.timeline_hours
                : 24}
              .label=${"Timeline Timeframe Window (Hours)"}
              @value-changed=${(e) =>
                this._updateConfigValue("timeline_hours", e.detail.value)}
            ></ha-selector>

            <ha-selector
              .hass=${this.hass}
              .selector=${{ number: { min: 3, max: 30, step: 1, mode: "box" } }}
              .value=${this._config.max_events !== undefined
                ? this._config.max_events
                : 10}
              .label=${"Maximum Recent Events in Feed"}
              @value-changed=${(e) =>
                this._updateConfigValue("max_events", e.detail.value)}
            ></ha-selector>
          </div>
        </div>

        <!-- 4. ACCESS CONTROL & ROLE PERMISSIONS -->
        <div class="editor-section">
          ${renderHeader("security", "Security & Access Permissions (RBAC)")}
          <div
            class="section-body"
            style="display: ${this._expandedSections.security
              ? "flex"
              : "none"};"
          >
            <p class="help-text">
              Restrict PIN Code & Schedule management to specific users. Non-admin users will only see the Door Controls and Timeline sections.
            </p>

            <ha-selector
              .hass=${this.hass}
              .selector=${{
                select: {
                  multiple: true,
                  custom_value: true,
                  options: this._users || [],
                },
              }}
              .value=${this._config.admin_users || []}
              .label=${"Admin User IDs with PIN Management Access"}
              @value-changed=${(e) =>
                this._updateConfigValue("admin_users", e.detail.value)}
            ></ha-selector>

            <ha-selector
              .hass=${this.hass}
              .selector=${{ boolean: {} }}
              .value=${this._config.require_admin || false}
              .label=${"Require Administrator Role (Alternative to specific users)"}
              @value-changed=${(e) =>
                this._updateConfigValue("require_admin", e.detail.value)}
            ></ha-selector>
          </div>
        </div>

        <!-- 5. PIN CODE & SLOT MANAGEMENT -->
        <div class="editor-section">
          ${renderHeader("slots", "PIN Code Slots & Automation")}
          <div
            class="section-body"
            style="display: ${this._expandedSections.slots
              ? "flex"
              : "none"};"
          >
            <ha-selector
              .hass=${this.hass}
              .selector=${{ boolean: {} }}
              .value=${this._config.collapse_inactive_slots !== false}
              .label=${"Collapse Inactive & Empty Slots (Show 1-Tap Expander)"}
              @value-changed=${(e) =>
                this._updateConfigValue(
                  "collapse_inactive_slots",
                  e.detail.value
                )}
            ></ha-selector>

            <ha-selector
              .hass=${this.hass}
              .selector=${{ number: { min: 1, max: 30, mode: "box" } }}
              .value=${this._config.slots !== undefined
                ? this._config.slots
                : 10}
              .label=${"Total Code Slots"}
              @value-changed=${(e) =>
                this._updateConfigValue("slots", e.detail.value)}
            ></ha-selector>

            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: "script" } }}
              .value=${this._config.manage_script || "script.manage_lock_codes"}
              .label=${"Manage Lock Codes Backend Script"}
              @value-changed=${(e) =>
                this._updateConfigValue("manage_script", e.detail.value)}
            ></ha-selector>
          </div>
        </div>
      </div>
    `;
  }
}

// --- ELEMENT REGISTRATION ---
if (!customElements.get("passable-lock-manager-card-editor")) {
  customElements.define(
    "passable-lock-manager-card-editor",
    PassableLockManagerCardEditor
  );
}
if (!customElements.get("lock-manager-card-editor")) {
  class LegacyLockManagerCardEditor extends PassableLockManagerCardEditor {}
  customElements.define(
    "lock-manager-card-editor",
    LegacyLockManagerCardEditor
  );
}

PassableLockManagerCard.getConfigElement = () =>
  document.createElement("passable-lock-manager-card-editor");

if (!customElements.get("passable-lock-manager-card")) {
  customElements.define(
    "passable-lock-manager-card",
    PassableLockManagerCard
  );
}
if (!customElements.get("lock-manager-card")) {
  class LegacyLockManagerCard extends PassableLockManagerCard {}
  customElements.define("lock-manager-card", LegacyLockManagerCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "passable-lock-manager-card",
  name: "Passable Lock Manager Card",
  preview: true,
  description:
    "Unified smart lock command center with live door toggles, 24h activity timeline, battery & jammed diagnostics, and slot PIN management.",
  documentationURL: "https://github.com/GBear09/passable-lock-manager-card",
});
