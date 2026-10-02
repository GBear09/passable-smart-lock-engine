# Changelog

All notable changes to **Passable Smart Lock Engine** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-10-02

### Changed
- **Frontend Card Design Unification (`passable-lock-manager-card.js` v2.3.1)**:
  - Replaced external unpkg CDN imports with local Home Assistant prototype extraction (`hui-entities-card`), removing all external network dependencies.
  - Converted root element to `<ha-card class="container">` for proper Lovelace theme inheritance and elevation.
  - Added `<ha-icon icon="mdi:lock-smart">` to the title and standardized header layout with `.header-left`.
  - Standardized title typography to 24px font size and 500 weight (`var(--ha-card-header-font-size, 24px)`).
  - Standardized `window.customCards` configuration with `documentationURL`.

## [1.2.0] - 2026-09-26

### Added
- Auto-discovery improvements, PIN slot synchronization, and multi-lock timeline optimizations.
