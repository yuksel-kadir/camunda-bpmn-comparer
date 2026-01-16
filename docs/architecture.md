# Architecture: Camunda BPMN Comparer

## Technology Stack
- **Frontend Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **BPMN Toolkit**: [bpmn-js](https://bpmn.io/toolkit/bpmn-js/)
- **Desktop Wrapper**: [Tauri](https://tauri.app/) (Rust-based back-end, Webview-based front-end)
- **Styling**: Vanilla CSS (CSS Variables)

## System Overview
The application follows a standard React component architecture wrapped within a Tauri shell.

### Directory Structure
- `src/`: React source code.
  - `components/`: UI components (Viewers, Diff List, etc.).
  - `services/`: Business logic, specifically the BPMN comparison engine.
  - `src-tauri/`: Rust source code for the desktop application wrapper.
- `docs/`: Technical documentation.

## Core Components
### `BpmnViewer.tsx`
A wrapper around the `bpmn-js` modeler/viewer. 
- Handles the lifecycle of the BPMN canvas.
- Exposes a `ViewerHandle` for imperative synchronization (panning/zooming).
- Applies visual markers for diffs.

### `bpmnComparer.ts` service
The brain of the comparison logic.
- Parses BPMN XML into a traversable structure.
- Implements the matching algorithm to identify additions, deletions, and modifications.
- Returns a structured `DiffResult` object used by the UI.

### `App.tsx` (Orchestrator)
- Manages the state of the application (currently loaded files, active diffs).
- Orchestrates the synchronization logic between the two `BpmnViewer` instances.
- Handles file selection events from the Tauri back-end.

### `HistoryPanel.tsx`
- Displays a list of previously compared files for quick access.
- Implements file existence checks to warn users (visual alerts) if historical files have been moved or deleted.
- Manages user interactions for reloading past comparisons.

## Technical Deep Dives
### Synchronization Architecture
The app uses a "Hybrid Synchronization" layer to ensure zero-lag mirroring:
1. **Immediate Layer**: When the user drags one viewer, a `requestAnimationFrame` loop applies a CSS `transform: translate(...)` to both canvases instantly.
2. **Persistence Layer**: Once the drag/pinch settles, the app calls the `canvas.viewbox()` API to update the internal state of `bpmn-js`. This prevents the "shaking" or "lag" typically associated with high-frequency SVG updates.

### Diff Calculation
1. **Mapping**: Elements are keyed by ID.
2. **Structural Diff**: Checks for existence in one side vs. the other.
3. **Attribute Diff**: Compares a whitelist of Camunda-specific attributes for items that exist in both versions.
4. **Overlay Distribution**: `App.tsx` passes the calculated diffs back to the `BpmnViewer` components, which then render the appropriate markers.
