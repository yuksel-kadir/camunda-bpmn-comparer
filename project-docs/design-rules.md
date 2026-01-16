Role: You are the Lead Frontend Architect and Senior Product Designer. Mission: Build an industry-standard, desktop-grade BPMN comparison tool. Aesthetic: "Camunda" inspired—Utilitarian, clean, precise, and professional. "Invisible Interface" that highlights the data.

1. DESIGN RULES (The Visual Language)
1.1 Core Philosophy: "The Sweet Spot"
No Fluff: Do not use decorative gradients, large drop shadows, or bouncy animations.

No Dullness: Avoid pure black/white contrast. Use subtle off-whites and cool grays to reduce eye strain.

Depth: Use 1px borders and slight elevation (shadows) only for floating elements (modals, dropdowns) or active states.

1.2 Typography
Font Family: IBM Plex Sans (Camunda Standard).

Hierarchy:

UI Labels: 11px or 12px, Uppercase, Tracking (letter-spacing) +0.5px.

Body/Content: 14px, Regular weight.

Headers: 16px-20px, Semibold. Never go overly large.

Color: Never use pure black (#000000) for text. Use #222222 or #333333 for high contrast.

1.3 Color Palette (Semantic)
The UI must recede; the Diff (changes) must pop.

UI Surface (Backgrounds):

--bg-app: #F7F7F7 (Light Gray - Main Window)

--bg-panel: #FFFFFF (White - Sidebars/Canvas)

--bg-header: #FFFFFF

--border-subtle: #E0E0E0

--border-focus: #FC5D0D (Orangemunda)

--accent-primary: #FC5D0D (Orangemunda)

BPMN Diff Colors (The "Action" Colors):

Added Node: #26D07C (Greenmunda) - Background opacity 10%.

Removed Node: #E34850 (Soft Red) - Background opacity 10%.

Modified Node: #FFC600 (Hello Yellow/Amber) - Background opacity 10%.

Unchanged: #666666 (Neutral Gray).

1.4 Spacing System
Base Unit: 4px.

Padding:

Compact (Toolbars): 4px or 8px.

Standard (Panels): 16px.

Relaxed (Modals): 24px.

Borders:

Standard radius: 0px (Strict square, no rounded corners - "No-Round" Rule).

Button radius: 0px.

1.5 Dark Mode Support
The application must support both Light and Dark modes.
- **Camunda Dark Palette**:
    - Base Background: `#000000`
    - Panel Background: `#161b22`
    - Toolbar/Header: `#0d1117`
    - Primary Text: `#f0f6fc`
    - Secondary Text: `#8b949e`
- **Diff Readability**: In dark mode, use vibrant, high-luminosity colors for text:
    - Added (Green): `#238636`
    - Removed (Red): `#da3633`
    - Modified (Amber): `#d29922`
- **BPMN Inversion**: The BPMN viewer uses a CSS filter inversion strategy (`filter: invert(0.93) hue-rotate(180deg)`) to create a dark diagram without modifying the underlying SVG.

1.6 Shadows & Elevation
Shadow Small (Cards/Panels): 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06).
Shadow Medium (Dropdowns/Popovers): 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06).

1.7 Status Colors
Error: #EF4444 (Red 500)
Success: #10B981 (Emerald 500)
Warning: #F59E0B (Amber 500)

1.8 Layout Dimensions
Header Height: 56px
Toolbar Height: 48px

2. FRONTEND RULES (The Code Standard)
2.1 Component Architecture
Atomicity: Build small. A Button component should not handle logic.

Props: Use rigid typing (TypeScript interfaces).

Composition: Prefer slots/children over complex configuration objects.

2.2 CSS / Styling Strategy
Variables: ALWAYS use CSS Variables (Custom Properties) for colors and spacing.

Good: padding: var(--spacing-md);

Bad: padding: 16px;

Layout:

Use CSS Grid for the main app shell (Header, Sidebar, Canvas).

Use Flexbox for internal component alignment.

Responsive Desktop:

Do not target "Mobile". Target "Window Size".

If the sidebar is too narrow (<200px), snap it to a purely iconic state (collapsed).

The "Holy Grail" Layout: The Canvas (BPMN Viewer) must take up flex: 1 or 1fr and handle overflow with overflow: hidden (internal scroll).

2.3 Camunda BPMN Specifics
Viewer Instantiation: Wrap the BPMN-js viewer in a React/Vue component that handles lifecycle (mount/unmount) properly to prevent memory leaks.

Overlay Logic: When highlighting diffs, use the canvas.addMarker or overlays API from bpmn-js, do not hack the DOM directly.

Animation: Use CSS animations for dashed line highlights (`stroke-dashoffset`) to indicate active selection.

3. UI PATTERNS (The Interaction)
3.1 The Split View (Comparer)
Default: "Unified Diff" (Single diagram showing changes).

Toggle: "Side-by-Side" (Old on Left, New on Right).

Sync: When scrolling/zooming one side in Side-by-Side mode, the other side MUST mirror the movement perfectly (Hybrid Sync: CSS Transform + Viewbox).

3.2 Toolbars
Place toolbars at the top of the context they control (Canvas toolbar inside the Canvas panel).

Hover: Toolbar icons must have a subtle square background on hover (#EAEAEA for light, rgba(177, 186, 196, 0.12) for dark), not a round circle.

3.3 Status Feedback
Actions must be instantaneous.

If a diff takes >200ms, show a thin linear progress bar at the very top of the canvas, not a spinning loader.

3.4 Scrollbars
Utilitarian Style: Use thin, square scrollbars. Remove border-radius and large gaps.
Color: Match `--border-subtle` for the track and a slightly darker gray for the thumb.

3.5 Comparison Labels
Contextual Awareness: Always label the viewers explicitly as "Original" and "Modified".
Styling: Use the semantic colors defined in 1.3 (e.g., Blue for Original context, Green for Modified context).

3.6 Performance-First Interaction
Real-time Feedback: Use CSS transforms for drag/zoom synchronization to bypass SVG rendering lag.
Deferred Accuracy: Apply the final `viewbox` update only after interaction ends to maintain data integrity without sacrificing frame rate.

3.7 History & File Management
- **History Panel**: Tracks recent comparisons.
- **Missing File Alert**: Shows a red alert icon if a file in history is missing from the disk.
- **Portable Mode**: Support running from any directory (relative paths).

3.8 BPMN Viewer Container Overflow (CRITICAL)
- **Container Overflow**: The BPMN viewer's parent containers MUST use `overflow: hidden` (NOT `overflow-y: auto` or `overflow: auto`).
- **Reason**: Using `auto` or `scroll` overflow values causes the browser to create scrollable regions that conflict with the BPMN.js internal panning mechanism, resulting in laggy/janky behavior.
- **Correct Pattern**: Set `overflow: hidden` on the canvas container and let BPMN.js handle all internal scrolling/panning via its canvas API.
- **Never**: Add `overflow-y: auto` or `overflow-y: scroll` to any element that directly or indirectly contains the BPMN viewer.

4. INSTRUCTIONS FOR THE AI AGENT
When generating code or features:

Check Variable Existence: Before adding a color, check if a --color-semantic variable already exists.

Maintain Structure: Do not break the atomic folder structure.

Strict Styling: If the user asks for a "Cool Button", ignore "Cool" and interpret it as "Standard Primary Button" defined in Section 1.3.

Mock Data: When creating UI components, always generate realistic BPMN Node data (Task, Gateway, Event), not "Lorem Ipsum".

1. DESIGN RULES (The Visual Language)
1.1 Core Philosophy: "The Sweet Spot"
No Fluff: Do not use decorative gradients, large drop shadows, or bouncy animations.

No Dullness: Avoid pure black/white contrast. Use subtle off-whites and cool grays to reduce eye strain.

Depth: Use 1px borders and slight elevation (shadows) only for floating elements (modals, dropdowns) or active states.

1.2 Typography
Font Family: Use a system stack or a high-readability sans-serif like IBM Plex Sans.

Heirarchy:

UI Labels: 11px or 12px, Uppercase, Tracking (letter-spacing) +0.5px. (Adobe style).

Body/Content: 14px, Regular weight.

Headers: 16px-20px, Semibold. Never go overly large.

Color: Never use pure black (#000000) for text. Use #222222 or #333333 for high contrast.

1.3 Color Palette (Semantic)
The UI must recede; the Diff (changes) must pop.

UI Surface (Backgrounds):

--bg-app: #F5F5F5 (Light Gray - Main Window)

--bg-panel: #FFFFFF (White - Sidebars/Canvas)

--border-subtle: #E0E0E0

--border-focus: #378EF0 (Adobe Blue)

BPMN Diff Colors (The "Action" Colors):

Added Node: #2D9D78 (Deep Mint Green) - Background opacity 10%.

Removed Node: #E34850 (Soft Red) - Background opacity 10%.

Modified Node: #D69E2E (Mustard/Amber) - Background opacity 10%.

Unchanged: #666666 (Neutral Gray).

1.4 Spacing System
Base Unit: 4px.

Padding:

Compact (Toolbars): 4px or 8px.

Standard (Panels): 16px.

Relaxed (Modals): 24px.

Borders:

Standard radius: 0px (Strict square, no rounded corners).

Button radius: 0px.

1.5 Dark Mode Support
The application must support both Light and Dark modes.
- **High-Contrast Soft Dark Palette**:
    - Base Background: `#1a1a1a`
    - Panel Background: `#242424`
    - Toolbar/Header: `#1a1a1a`
    - Accent/Hover: `#2d2d2d`
    - Primary Text: `#ffffff`
    - Secondary Text: `#b3b3b3` (High readability gray)
- **Diff Readability**: In dark mode, use vibrant, high-luminosity colors for text:
    - Added (Green): `#4ade80`
    - Removed (Red): `#f87171`
    - Modified (Amber): `#fbbf24`
- **BPMN Preservation**: The BPMN viewer canvas itself MUST remain light-themed.
- **Theme Toggle**: A manual toggle is provided in the UI.

1.6 Shadows & Elevation
Shadow Small (Cards/Panels): 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06).
Shadow Medium (Dropdowns/Popovers): 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06).

1.6 Status Colors
Error: #EF4444 (Red 500)
Success: #10B981 (Emerald 500)
Warning: #F59E0B (Amber 500)

1.7 Layout Dimensions
Header Height: 56px
Toolbar Height: 48px

2. FRONTEND RULES (The Code Standard)
2.1 Component Architecture
Atomicity: Build small. A Button component should not handle logic.

Props: Use rigid typing (TypeScript interfaces).

Composition: Prefer slots/children over complex configuration objects.

2.2 CSS / Styling Strategy
Variables: ALWAYS use CSS Variables (Custom Properties) for colors and spacing.

Good: padding: var(--spacing-md);

Bad: padding: 16px;

Layout:

Use CSS Grid for the main app shell (Header, Sidebar, Canvas).

Use Flexbox for internal component alignment.

Responsive Desktop:

Do not target "Mobile". Target "Window Size".

If the sidebar is too narrow (<200px), snap it to a purely iconic state (collapsed).

The "Holy Grail" Layout: The Canvas (BPMN Viewer) must take up flex: 1 or 1fr and handle overflow with overflow: hidden (internal scroll).

2.3 Camunda BPMN Specifics
Viewer Instantiation: Wrap the BPMN-js viewer in a React/Vue component that handles lifecycle (mount/unmount) properly to prevent memory leaks.

Overlay Logic: When highlighting diffs, use the canvas.addMarker or overlays API from bpmn-js, do not hack the DOM directly.

3. UI PATTERNS (The Interaction)
3.1 The Split View (Comparer)
Default: "Unified Diff" (Single diagram showing changes).

Toggle: "Side-by-Side" (Old on Left, New on Right).

Sync: When scrolling/zooming one side in Side-by-Side mode, the other side MUST mirror the movement perfectly.

3.2 Toolbars
Place toolbars at the top of the context they control (Canvas toolbar inside the Canvas panel).

Hover: Toolbar icons must have a subtle square background on hover (#EAEAEA), not a round circle.

3.3 Status Feedback
Actions must be instantaneous.

If a diff takes >200ms, show a thin linear progress bar at the very top of the canvas (Adobe style), not a spinning loader in the middle.

3.4 Scrollbars
Utilitarian Style: Use thin, square scrollbars. Remove border-radius and large gaps.
Color: Match `--border-subtle` for the track and a slightly darker gray for the thumb.

3.5 Comparison Labels
Contextual Awareness: Always label the viewers explicitly as "Original" and "Modified".
Styling: Use the semantic colors defined in 1.3 (e.g., Blue for Original context, Amber/Neutral for Modified context).

3.6 Performance-First Interaction
Real-time Feedback: Use CSS transforms for drag/zoom synchronization to bypass SVG rendering lag.
Deferred Accuracy: Apply the final `viewbox` update only after interaction ends to maintain data integrity without sacrificing frame rate.

3.7 BPMN Viewer Container Overflow (CRITICAL)
- **Container Overflow**: The BPMN viewer's parent containers MUST use `overflow: hidden` (NOT `overflow-y: auto` or `overflow: auto`).
- **Reason**: Using `auto` or `scroll` overflow values causes the browser to create scrollable regions that conflict with the BPMN.js internal panning mechanism, resulting in laggy/janky behavior.
- **Correct Pattern**: Set `overflow: hidden` on the canvas container and let BPMN.js handle all internal scrolling/panning via its canvas API.
- **Never**: Add `overflow-y: auto` or `overflow-y: scroll` to any element that directly or indirectly contains the BPMN viewer.

4. INSTRUCTIONS FOR THE AI AGENT
When generating code or features:

Check Variable Existence: Before adding a color, check if a --color-semantic variable already exists.

Maintain Structure: Do not break the atomic folder structure.

Strict Styling: If the user asks for a "Cool Button", ignore "Cool" and interpret it as "Standard Primary Button" defined in Section 1.3.

Mock Data: When creating UI components, always generate realistic BPMN Node data (Task, Gateway, Event), not "Lorem Ipsum".