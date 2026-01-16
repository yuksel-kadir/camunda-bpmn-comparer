# Versioning and Build Naming Rules

This document outlines the standard procedures for versioning and naming build output files for the **Camunda BPMN Comparer**.

## 1. Versioning Scheme

We follow [Semantic Versioning (SemVer)](https://semver.org/) format: `MAJOR.MINOR.PATCH`.

- **Current Version**: `1.0.0`
- **MAJOR**: Incompatible API or architectural changes, or significant UI overhauls.
- **MINOR**: New functional features that are backwards compatible.
- **PATCH**: Backwards compatible bug fixes and minor refinements.

## 2. Version Synchronization

To maintain consistency across the application layers:

- **Source of Truth**: The version in `src-tauri/tauri.conf.json` is the primary source of truth.
- **Frontend Sync**: The `package.json` version MUST match `src-tauri/tauri.conf.json`.
- **UI Display**: The version number MUST be displayed in the UI (e.g., footer and "About" modal).

## 3. Build Output Naming

Standardized filenames including descriptive keywords for easier identification.

### 3.1 Portable Binaries (Windows)
- **Format**: `camunda-bpmn-comparer-v{VERSION}-portable.exe`
- **Example**: `camunda-bpmn-comparer-v1.0.0-portable.exe`

### 3.2 Installers
- **Format**: `camunda-bpmn-comparer-v{VERSION}-installer.{ext}`
- **Example**: `camunda-bpmn-comparer-v1.0.0-installer.msi`

## 4. Release Process

1. **Version Bump**: Update version in `tauri.conf.json` and `package.json`.
2. **Tagging**: Every release MUST be tagged in git as `v{VERSION}`.
3. **About Modal**: Ensure the "About" modal is updated with any new technology dependencies.
4. **Drafting Release**: GitHub Actions automatically creates a draft release when a push to `main` occurs.
