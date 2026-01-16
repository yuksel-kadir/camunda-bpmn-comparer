# Features: Camunda BPMN Comparer

## Core Visual Features
### Side-by-Side BPMN View
- Dual viewers showing the "Original" (Left) and "Modified" (Right) versions of a process model.
- High-fidelity rendering using `bpmn-js`.
- Responsive layout that maximizes canvas space.

### Ultra-Smooth Synchronized Navigation
- **Hybrid Sync Technology**: Combines GPU-accelerated CSS transforms for instant 60fps mirroring with accurate debounce-based viewbox updates.
- **Mirrored Panning & Zooming**: Interactions on one diagram are instantly reflected on the other.
- **Animated Highlights**: Dashed lines with rotating animations (`stroke-dashoffset`) clearly indicate selected elements.

### Visual Diff Highlighting
- **Camunda Color System**: 
    - <span style="color: #26D07C">**Green (Greenmunda)**</span>: Added elements.
    - <span style="color: #E34850">**Red (Soft Red)**</span>: Removed elements.
    - <span style="color: #FFC600">**Amber (Hello Yellow)**</span>: Modified elements.
- **Markers**: Visual overlays placed directly on the BPMN canvas.
- **Dynamic Legend**: Interactive legend explaining the highlighting state.

## Analysis & Inspection
### Smart Diff List
- **Categorized Changes**: Added, Removed, and Modified sections.
- **Smooth Scrolling**: Industry-standard smooth scroll behavior for exploring large change sets.
- **Scroll-to-Item Strategy**: Clicking a BPMN element scrolls the list to the corresponding change item.

### Detailed Element Comparison
- Deep inspection of attributes for modified elements.
- View changes in:
    - Basic properties (Name, ID).
    - Camunda extensions (Async, Exclusivity).
    - Technical implementation (Java Class, Delegate Expression, Script).
    - Variable mappings (Inputs/Outputs).

## File & History Management
- **History Tracking**: Automatically tracks recent comparisons.
- **Missing File Detection**: 
    - Real-time checks for file existence.
    - **Visual Alerts**: Red warning icons identify files that have been moved or deleted since the last session.
- **Portable Deployment**:
    - **No Installation Required**: Run directly from a USB stick or network drive.
    - **Cross-Platform**: Available as `.exe` (Windows), `.AppImage` (Linux), and `.app` (macOS).

## User Experience
### Professional Camunda Branding
- **"Invisible Interface"**: Clean, utilitarian design inspired by Camunda's official design system.
- **Dark Mode**: Fully optimized dark theme with intelligent BPMN color inversion.
- **No-Round Aesthetic**: Strict square corners for a precise, engineering-grade look.

### Native Performance
- **Tauri Powered**: Lightweight visual footprint with native system access.
- **Fast Diff Calculation**: optimized Rust/JS bridge for immediate results.
