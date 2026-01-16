# Prompt: Implement Ultra-Smooth Synchronized BPMN Viewer Panning & Zooming

## Context

I have a **Camunda 7 BPMN Flow Comparer** application built with:
- **React + TypeScript** (frontend)
- **Tauri** (desktop wrapper)
- **bpmn-js** (BPMN diagram rendering library, loaded via CDN)

The app displays **two BPMN diagrams side-by-side** (Original vs Modified) for comparison. Users need to **pan and zoom both viewers in perfect sync** so they can compare the same region of both diagrams.

## Feature Requirement

When the user pans or zooms one viewer, the other viewer must follow **in real-time with smooth 60fps performance**. This is a **critical feature** for flow comparison.

## Technical Challenge

The bpmn-js library's `canvas.viewbox()` method is **expensive** (~5-15ms per call) because it:
1. Recalculates element positions
2. Triggers internal event handlers
3. Repaints the SVG canvas

Calling this method 60 times per second on the synced viewer causes **severe lag**.

## Approaches That Don't Work Well

### 1. React State Synchronization
```tsx
// DON'T DO THIS
const [syncedViewbox, setSyncedViewbox] = useState(null);
// Triggers full re-render cycle on every frame
```
**Problem**: React re-renders the entire component tree on every state change.

### 2. Direct Imperative Calls
```tsx
// Better, but still laggy
viewer.on('canvas.viewbox.changed', (e) => {
  otherViewer.get('canvas').viewbox(e.viewbox);
});
```
**Problem**: `canvas.viewbox()` is inherently slow.

### 3. Throttling/Debouncing
```tsx
// Reduces calls but introduces choppy movement
throttle(() => otherViewer.canvas.viewbox(newViewbox), 32);
```
**Problem**: Either still too many expensive calls, or movement appears stuttery.

## The Solution: CSS Transform-Based Sync

Use **GPU-accelerated CSS transforms** for real-time visual sync, then apply actual viewbox on debounced delay.

### Architecture

```
During Drag:
├── Source Viewer: Native bpmn-js panning (smooth)
└── Target Viewer: CSS transform applied to SVG layer (GPU-accelerated, ~0ms)

After 150ms pause:
└── Target Viewer: Apply actual canvas.viewbox() for accuracy
    └── Update cached base viewbox
```

### Key Implementation Details

#### 1. Expose a Handle from BpmnViewer
```tsx
interface ViewerHandle {
  applyTransform: (sourceViewbox: Viewbox) => void;  // Instant, GPU
  updateViewbox: (viewbox: Viewbox) => void;         // Accurate, expensive
}

onInit?: (handle: ViewerHandle) => void;
```

#### 2. Cache Everything
```tsx
// Cache these ONCE, not every frame
let cachedSvgLayer: HTMLElement | null = null;  // Query once
let baseViewbox: Viewbox | null = null;          // The reference point
let pendingRAF: number | null = null;            // For batching
```

#### 3. Apply Transform (GPU Path)
```tsx
applyTransform: (sourceViewbox) => {
  // Use cached SVG layer (query once)
  if (!cachedSvgLayer) {
    cachedSvgLayer = container.querySelector('.djs-container svg');
  }
  
  // Use cached base viewbox (NO bpmn-js calls!)
  if (!baseViewbox) {
    baseViewbox = viewer.get('canvas').viewbox();  // Only once
  }
  
  // Cancel previous frame to avoid stacking
  if (pendingRAF) cancelAnimationFrame(pendingRAF);
  
  // Batch with browser paint cycle
  pendingRAF = requestAnimationFrame(() => {
    const scale = baseViewbox.outer.width / baseViewbox.width;
    const dx = (baseViewbox.x - sourceViewbox.x) * scale;
    const dy = (baseViewbox.y - sourceViewbox.y) * scale;
    
    // GPU-accelerated transform
    cachedSvgLayer.style.transform = `translate(${dx}px, ${dy}px)`;
    cachedSvgLayer.style.transformOrigin = 'top left';
  });
}
```

#### 4. Apply Viewbox (Accuracy Path)
```tsx
updateViewbox: (viewbox) => {
  // Cancel pending transforms
  if (pendingRAF) cancelAnimationFrame(pendingRAF);
  
  // Remove CSS transform
  cachedSvgLayer.style.transform = '';
  
  // Apply actual viewbox (expensive, but only once)
  canvas.viewbox(viewbox);
  
  // Update cache for next drag session
  baseViewbox = canvas.viewbox();
}
```

#### 5. Parent Component (App.tsx)
```tsx
const leftRef = useRef<ViewerHandle | null>(null);
const rightRef = useRef<ViewerHandle | null>(null);
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleViewboxChange = useCallback((viewbox, source) => {
  const target = source === 'left' ? rightRef.current : leftRef.current;
  if (!target) return;
  
  // INSTANT: CSS transform
  target.applyTransform(viewbox);
  
  // DEBOUNCED: Accurate viewbox
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    target.updateViewbox(viewbox);
  }, 150);
}, []);
```

## Critical Points

1. **Never call `canvas.viewbox()` during active drag** - Use cached values only
2. **Cache the SVG element** - `querySelector` is slow if called 60x/sec
3. **Use requestAnimationFrame** - Batches transforms with browser paint
4. **Prevent event echo** - Use `isSyncingRef` flag to avoid infinite loops
5. **Update cache after viewbox change** - So next drag uses correct base

## Files to Modify

1. `components/BpmnViewer.tsx` - Add handle with applyTransform/updateViewbox
2. `App.tsx` - Use refs to store handles, implement hybrid sync

## Expected Result

- **Smooth 60fps** panning on both viewers
- **Visual sync is instant** (CSS transform)
- **Accurate alignment** after 150ms pause (actual viewbox)
- **No lag or stuttering** during rapid mouse movement
