import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IconZoomIn, IconZoomOut, IconFitScreen } from './Icons';

// @ts-ignore
const BpmnJS = window.BpmnJS;

// Handle interface for viewer sync
export interface ViewerHandle {
  setViewbox: (viewbox: any) => void;
  setZoom: (zoom: number) => void;
  resetView: () => void;
  getViewbox: () => any;
}

interface BpmnViewerProps {
  xml: string;
  highlightsAdded?: string[];
  highlightsRemoved?: string[];
  highlightsModified?: string[];
  hoverHighlightId?: string | null;
  hoverHighlightColor?: string;
  selectedId?: string | null;
  selectedHighlightColor?: string;
  zoomRequest?: { id: string | null; key: number };
  onViewboxChange?: (viewbox: any) => void;
  onZoom?: (zoom: number) => void;
  onInit?: (handle: ViewerHandle) => void;
  onElementClick?: (id: string) => void;
}

export const BpmnViewer: React.FC<BpmnViewerProps> = ({
  xml,
  highlightsAdded = [],
  highlightsRemoved = [],
  highlightsModified = [],
  hoverHighlightId,
  hoverHighlightColor,
  selectedId,
  selectedHighlightColor,
  zoomRequest,
  onViewboxChange,
  onZoom,
  onInit,
  onElementClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const xmlRef = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const isImportingRef = useRef<boolean>(false);
  const pendingImportRef = useRef<string | null>(null);
  const viewerReadyRef = useRef<boolean>(false);

  // Sync state - prevent feedback loops
  const isSyncingRef = useRef<boolean>(false);

  const onViewboxChangeRef = useRef(onViewboxChange);
  const onZoomRef = useRef(onZoom);
  const onElementClickRef = useRef(onElementClick);
  onViewboxChangeRef.current = onViewboxChange;
  onZoomRef.current = onZoom;
  onElementClickRef.current = onElementClick;

  useEffect(() => {
    if (!containerRef.current) return;

    const initFrame = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        setTimeout(() => {
          if (containerRef.current) initViewer();
        }, 100);
        return;
      }

      initViewer();
    });

    const initViewer = () => {
      if (!containerRef.current || viewerRef.current) return;

      const viewer = new BpmnJS({
        container: containerRef.current,
        keyboard: { bindTo: window },
        additionalModules: [
          {
            contextPadProvider: ['value', { getContextPadEntries: () => ({}) }],
            paletteProvider: ['value', { getPaletteEntries: () => ({}) }],
            move: ['value', {}],
            bendpoints: ['value', {}],
            resize: ['value', { canResize: () => false }],
            labelEditingProvider: ['value', {}]
          }
        ]
      });

      viewerRef.current = viewer;
      viewer.on('diagram.init', () => { viewerReadyRef.current = true; });
      viewerReadyRef.current = true;

      const canvas = viewer.get('canvas');

      // Simple viewbox sync
      const handleCanvasChange = () => {
        if (isSyncingRef.current) return;
        onViewboxChangeRef.current?.(canvas.viewbox());
      };

      viewer.on('canvas.viewbox.changing', handleCanvasChange);
      viewer.on('canvas.viewbox.changed', handleCanvasChange);

      // Element click sync
      viewer.on('element.click', (event: any) => {
        const { element } = event;
        if (element && element.id && onElementClickRef.current) {
          onElementClickRef.current(element.id);
        }
      });
    };

    return () => {
      cancelAnimationFrame(initFrame);
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        viewerReadyRef.current = false;
      }
    };
  }, []);

  // Import XML and manage highlights
  useEffect(() => {
    let isMounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const manageDiagram = async () => {
      const viewer = viewerRef.current;

      if (!viewer || !viewerReadyRef.current) {
        retryTimeout = setTimeout(() => {
          if (isMounted) manageDiagram();
        }, 50);
        return;
      }

      try {
        if (xml && xmlRef.current !== xml) {
          if (isImportingRef.current) {
            pendingImportRef.current = xml;
            return;
          }

          isImportingRef.current = true;
          setIsReady(false);

          try {
            await viewer.importXML(xml);
          } catch (importErr) {
            console.error('XML import failed:', importErr);
            isImportingRef.current = false;
            if (pendingImportRef.current && isMounted) {
              pendingImportRef.current = null;
              xmlRef.current = null;
              setTimeout(() => manageDiagram(), 0);
            }
            return;
          }

          if (!isMounted || !viewerRef.current) {
            isImportingRef.current = false;
            return;
          }

          xmlRef.current = xml;
          isImportingRef.current = false;

          try {
            viewer.get('canvas').zoom('fit-viewport', 'auto');
          } catch (e) {
            console.warn('Initial zoom failed, possibly due to hidden container:', e);
            // Continue to set isReady(true) so the loader disappears
          }

          setIsReady(true);

          if (pendingImportRef.current && isMounted) {
            pendingImportRef.current = null;
            xmlRef.current = null;
            setTimeout(() => manageDiagram(), 0);
            return;
          }
        }

        if (!isMounted || !viewerRef.current) return;
        if (!xmlRef.current) return;

        const canvas = viewer.get('canvas');
        const elementRegistry = viewer.get('elementRegistry');

        elementRegistry.forEach((element: any) => {
          try {
            canvas.removeMarker(element.id, 'highlight-added');
            canvas.removeMarker(element.id, 'highlight-removed');
            canvas.removeMarker(element.id, 'highlight-modified');
            canvas.removeMarker(element.id, 'hover-highlight');
            canvas.removeMarker(element.id, 'selection-highlight');
          } catch (e) { }
        });

        highlightsAdded.forEach(id => {
          try { canvas.addMarker(id, 'highlight-added'); } catch (e) { }
        });

        highlightsRemoved.forEach(id => {
          try { canvas.addMarker(id, 'highlight-removed'); } catch (e) { }
        });

        highlightsModified.forEach(id => {
          try { canvas.addMarker(id, 'highlight-modified'); } catch (e) { }
        });

        if (hoverHighlightId) {
          try { canvas.addMarker(hoverHighlightId, 'hover-highlight'); } catch (e) { }
        }

        if (selectedId) {
          try { canvas.addMarker(selectedId, 'selection-highlight'); } catch (e) { }
        }

      } catch (err) {
        console.error('Error in BPMN viewer:', err);
        if (isMounted) setIsReady(false);
      }
    };

    manageDiagram();

    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [xml, highlightsAdded, highlightsRemoved, highlightsModified, hoverHighlightId, selectedId]);

  // Handle zoom requests
  useEffect(() => {
    const zoomToId = zoomRequest?.id;
    const viewer = viewerRef.current;

    if (!viewer || !isReady || !zoomToId) return;

    try {
      const canvas = viewer.get('canvas');
      const elementRegistry = viewer.get('elementRegistry');
      const element = elementRegistry.get(zoomToId);

      if (!element) return;

      let bbox;
      if (element.waypoints && Array.isArray(element.waypoints) && element.waypoints.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        element.waypoints.forEach((point: { x: number, y: number }) => {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        });
        bbox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      } else if (typeof element.x === 'number' && typeof element.y === 'number' &&
        typeof element.width === 'number' && typeof element.height === 'number') {
        bbox = { x: element.x, y: element.y, width: element.width, height: element.height };
      } else {
        return;
      }

      if (bbox.width === 0 || bbox.height === 0) {
        bbox = {
          ...bbox,
          width: bbox.width || 50,
          height: bbox.height || 50,
          x: bbox.x - (bbox.width ? 0 : 25),
          y: bbox.y - (bbox.height ? 0 : 25)
        };
      }

      const viewbox = canvas.viewbox();
      const viewport = viewbox.outer;
      if (!viewport || viewport.width === 0 || viewport.height === 0) return;

      const PADDING_PX = 120;
      const MAX_ZOOM = 1.1;

      const paddedViewportWidth = Math.max(1, viewport.width - PADDING_PX * 2);
      const paddedViewportHeight = Math.max(1, viewport.height - PADDING_PX * 2);

      const scaleX = paddedViewportWidth / bbox.width;
      const scaleY = paddedViewportHeight / bbox.height;
      let newScale = Math.min(scaleX, scaleY, MAX_ZOOM);

      const newViewbox = {
        x: bbox.x + bbox.width / 2 - viewport.width / 2 / newScale,
        y: bbox.y + bbox.height / 2 - viewport.height / 2 / newScale,
        width: viewport.width / newScale,
        height: viewport.height / newScale
      };

      canvas.viewbox(newViewbox);
      onViewboxChange?.(newViewbox);
    } catch (e) {
      console.error(`Failed to zoom to element ${zoomToId}`, e);
    }
  }, [zoomRequest, isReady]);

  // Expose handle for sync
  useEffect(() => {
    if (!viewerRef.current || !isReady || !containerRef.current) return;
    if (!onInit) return;

    const viewer = viewerRef.current;
    const canvas = viewer.get('canvas');

    const handle: ViewerHandle = {
      setViewbox: (viewbox: any) => {
        if (!viewerRef.current || !containerRef.current) return;
        isSyncingRef.current = true;
        try {
          canvas.viewbox(viewbox);
        } catch (e) {
          // Ignore sync errors if canvas is not ready
        }
        setTimeout(() => { isSyncingRef.current = false; }, 10);
      },

      setZoom: (zoom: number) => {
        if (!viewerRef.current || !containerRef.current) return;
        isSyncingRef.current = true;
        try {
          canvas.zoom(zoom);
        } catch (e) {
          // Ignore sync errors if canvas is not ready
        }
        setTimeout(() => { isSyncingRef.current = false; }, 10);
      },

      resetView: () => {
        if (!viewerRef.current || !containerRef.current) return;
        try {
          canvas.zoom('fit-viewport', 'auto');
        } catch (e) {
          // Ignore zoom errors during reset
        }
      },

      getViewbox: () => {
        try {
          return canvas.viewbox();
        } catch (e) {
          return null;
        }
      }
    };

    onInit(handle);
  }, [isReady, onInit]);

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const canvas = viewer.get('canvas');

    if (direction === 'reset') {
      canvas.zoom('fit-viewport', 'auto');
      onViewboxChange?.(canvas.viewbox());
    } else {
      const zoomLevel = canvas.zoom();
      const newZoom = direction === 'in' ? zoomLevel * 1.2 : zoomLevel / 1.2;
      canvas.zoom(newZoom);
      onZoom?.(newZoom);
    }
  };

  return (
    <div
      className="group bpmn-viewer-main"
      style={{
        // @ts-ignore
        '--hover-stroke': hoverHighlightColor || 'var(--highlight-hover)',
        '--select-stroke': selectedHighlightColor || 'var(--highlight-select)',
        '--hover-glow': hoverHighlightColor ? hoverHighlightColor.replace('rgb', 'rgba').replace(')', ', 0.4)') : 'var(--highlight-glow-sm)',
        '--select-glow': selectedHighlightColor ? selectedHighlightColor.replace('rgb', 'rgba').replace(')', ', 0.6)') : 'var(--highlight-glow-lg)',
      }}
    >
      <div ref={containerRef} className="w-full h-full bpmn-viewer-container"></div>

      {!isReady && (
        <div className="bpmn-loading-overlay">
          <div className="bpmn-loading-spinner"></div>
          <span className="bpmn-loading-text">Loading diagram...</span>
        </div>
      )}

      <div className="zoom-controls">
        <button onClick={() => handleZoom('in')} className="zoom-btn" title="Zoom in">
          <IconZoomIn className="icon-lg" />
        </button>
        <button onClick={() => handleZoom('out')} className="zoom-btn" title="Zoom out">
          <IconZoomOut className="icon-lg" />
        </button>
        <button onClick={() => handleZoom('reset')} className="zoom-btn zoom-btn-separator" title="Reset zoom">
          <IconFitScreen className="icon-lg" />
        </button>
      </div>
    </div>
  );
};