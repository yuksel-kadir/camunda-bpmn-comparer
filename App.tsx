import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FileUploader } from './components/FileUploader';
import { BpmnViewer, ViewerHandle } from './components/BpmnViewer';
import { DiffSummary } from './components/DiffSummary';

import { compareBpmn } from './services/bpmnComparer';
import { DiffResult } from './types';
import { IconDiagram, IconRotateCcw, IconFitScreen, IconSun, IconMoon, IconHelpCircle, IconSwap, IconHistory, IconInfo } from './components/Icons';
import { NavigationHelp } from './components/NavigationHelp';
import { Legend } from './components/Legend';
import { HistoryPanel } from './components/HistoryPanel';
import { AboutModal } from './components/AboutModal';
import { historyService } from './services/historyService';
import { ComparisonHistoryItem } from './types';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  const [file1, setFile1] = useState<{ name: string; content: string; path?: string } | null>(null);
  const [file2, setFile2] = useState<{ name: string; content: string; path?: string } | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);

  const version = "1.0.0";

  const [zoomRequest, setZoomRequest] = useState<{ id: string | null; key: number }>({ id: null, key: 0 });


  // Refs for viewer sync
  const leftHandleRef = useRef<ViewerHandle | null>(null);
  const rightHandleRef = useRef<ViewerHandle | null>(null);

  // Viewbox sync - when one viewer changes, sync to the other
  const handleLeftViewboxChange = useCallback((viewbox: any) => {
    rightHandleRef.current?.setViewbox(viewbox);
  }, []);

  const handleRightViewboxChange = useCallback((viewbox: any) => {
    leftHandleRef.current?.setViewbox(viewbox);
  }, []);

  // Zoom sync handlers
  const handleLeftZoom = useCallback((zoomLevel: number) => {
    rightHandleRef.current?.setZoom(zoomLevel);
  }, []);

  const handleRightZoom = useCallback((zoomLevel: number) => {
    leftHandleRef.current?.setZoom(zoomLevel);
  }, []);

  const getHighlightColor = useCallback((id: string | null) => {
    if (!id || !diffResult) return undefined;
    if (diffResult.added.includes(id)) return '#26D07C'; // Greenmunda
    if (diffResult.removed.includes(id)) return '#E34850';
    if (diffResult.modified.some(m => m.id === id)) return '#FFC600'; // Hello Yellow
    return undefined;
  }, [diffResult]);

  const handleCompare = useCallback(() => {
    if (!file1 || !file2) {
      setError(t('errors.missingFiles'));
      return;
    }
    setError(null);
    setIsLoading(true);
    setDiffResult(null);
    setSelectedId(null);
    setHoveredId(null);
    setZoomRequest({ id: null, key: 0 });

    setTimeout(() => {
      try {
        const result = compareBpmn(file1.content, file2.content);
        setDiffResult(result);

        // Save to history if we have paths
        if (file1.path && file2.path) {
          historyService.saveComparison(
            { path: file1.path, name: file1.name },
            { path: file2.path, name: file2.name }
          );
          setHistoryRefreshKey(prev => prev + 1);
        }
      } catch (e) {
        console.error('Comparison error:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during comparison.';
        setError(t('errors.comparisonFailed', { error: errorMessage }));
        setDiffResult(null);
      } finally {
        setIsLoading(false);
      }
    }, 50);

  }, [file1, file2]);

  const handleReset = useCallback(() => {
    setDiffResult(null);
    setError(null);
    setIsLoading(false);
    setSelectedId(null);
    setHoveredId(null);
    setZoomRequest({ id: null, key: 0 });
  }, []);

  const handleFile1Change = useCallback((file: { name: string; content: string } | null) => {
    setFile1(file);
    handleReset();
  }, [handleReset]);

  const handleFile2Change = useCallback((file: { name: string; content: string; path?: string } | null) => {
    setFile2(file);
    handleReset();
  }, [handleReset]);

  const handleHistorySelect = async (item: ComparisonHistoryItem) => {
    setError(null);
    setIsLoading(true);
    setShowHistory(false);

    try {
      const validation = await historyService.validateItem(item);
      if (!validation.valid) {
        throw new Error(t('errors.reExecuteMissing', { files: validation.missingFiles.join(', ') }));
      }

      const files = await historyService.loadFiles(item);

      setFile1({ name: item.file1.name, content: files.file1, path: item.file1.path });
      setFile2({ name: item.file2.name, content: files.file2, path: item.file2.path });

      // Auto-trigger comparison after loading
      setTimeout(() => {
        try {
          const result = compareBpmn(files.file1, files.file2);
          setDiffResult(result);
        } catch (err) {
          setError(`Comparison failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setIsLoading(false);
        }
      }, 100);

    } catch (e) {
      console.error('History re-execution error:', e);
      const message = e instanceof Error ? e.message : (typeof e === 'string' ? e : JSON.stringify(e));
      setError(t('errors.reExecuteFailed', { error: message }));
      setIsLoading(false);
    }
  };

  const handleResetView = useCallback(() => {
    leftHandleRef.current?.resetView();
    rightHandleRef.current?.resetView();
    // Also clear selection/hover as they are usually tied to a specific zoom/view
    setSelectedId(null);
    setHoveredId(null);
    setZoomRequest({ id: null, key: 0 });
  }, []);

  const handleElementClick = (id: string) => {
    const isAlreadySelected = selectedId === id;
    const newSelectedId = isAlreadySelected ? null : id;
    setSelectedId(newSelectedId);
    setZoomRequest(prev => ({ id: newSelectedId, key: prev.key + 1 }));

    // Scroll to item in the list if selecting
    if (!isAlreadySelected) {
      setTimeout(() => {
        const element = document.getElementById(`diff-item-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleReverse = useCallback(() => {
    const temp = file1;
    setFile1(file2);
    setFile2(temp);
    handleReset();
  }, [file1, file2, handleReset]);

  return (
    <div className={`app-shell ${theme === 'dark' ? 'dark-theme' : ''}`}>
      {/* Top Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <div className="toolbar-item">
            <span className="text-label font-semibold">{t('common.original')}:</span>
            <FileUploader onFileLoad={handleFile1Change} title={t('common.loadOriginal')} variant="compact" fileName={file1?.name} />
          </div>

          <button
            onClick={handleReverse}
            className="btn-secondary btn-icon-md"
            title={t('common.swap')}
            disabled={!file1 && !file2}
          >
            <IconSwap className="icon-sm" />
          </button>

          <div className="toolbar-item">
            <span className="text-label font-semibold">{t('common.modified')}:</span>
            <FileUploader onFileLoad={handleFile2Change} title={t('common.loadModified')} variant="compact" fileName={file2?.name} />
          </div>

          <button
            onClick={handleCompare}
            disabled={!file1 || !file2 || isLoading}
            className={`btn-primary btn-compact ${(!file1 || !file2) ? 'btn-disabled' : ''}`}
            title={t('common.comparisonTitle')}
          >
            {isLoading ? t('common.comparing') : t('common.compare')}
          </button>
        </div>

        <div className="toolbar-item">
          {isLoading && (
            <div className="loading-bar-container">
              <div className="loading-bar-fill"></div>
            </div>
          )}

          {diffResult && (
            <div className="toolbar-item">
              <button
                onClick={handleResetView}
                className="btn-secondary"
                title={t('common.resetView')}
              >
                <IconFitScreen className="icon-sm" />
                <span className="btn-label">{t('common.resetView')}</span>
              </button>

              <button
                onClick={handleReset}
                className="btn-secondary"
                title={t('common.clearResults')}
              >
                <IconRotateCcw className="icon-sm" />
                <span className="btn-label">{t('common.clearResults')}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setShowHistory(prev => !prev);
              if (showHelp) setShowHelp(false);
            }}
            className={`btn-secondary btn-icon ${showHistory ? 'btn-active' : ''}`}
            title={t('common.history')}
          >
            <IconHistory className="icon-md" />
          </button>

          <button
            onClick={() => {
              setShowHelp(prev => !prev);
              if (showHistory) setShowHistory(false);
            }}
            className={`btn-secondary btn-icon ${showHelp ? 'btn-active' : ''} ${!diffResult ? 'btn-disabled' : ''}`}
            title={!diffResult ? t('common.helpDisabled') : t('common.help')}
            disabled={!diffResult}
          >
            <IconHelpCircle className="icon-md" />
          </button>

          <button
            onClick={toggleTheme}
            className="btn-secondary btn-icon"
            title={theme === 'light' ? t('common.themeDark') : t('common.themeLight')}
          >
            {theme === 'light' ? <IconMoon className="icon-md" /> : <IconSun className="icon-md" />}
          </button>
        </div>
      </div>

      <main className="main-content">
        {error && (
          <div className="banner-error">
            {error}
          </div>
        )}

        <div className="canvas-area">
          <div className="comparison-container">
            {diffResult ? (
              <div className="diff-content-wrapper">
                <div className="diff-summary-wrapper">
                  <div className="panel diff-summary-panel">
                    <DiffSummary diffResult={diffResult} onElementHover={setHoveredId} onElementClick={handleElementClick} selectedId={selectedId} />
                  </div>
                </div>

                <div className="viewers-grid">
                  <div className="panel bpmn-viewer-panel">
                    <div className="panel-header">
                      <span className="panel-header-label original">{t('common.original')}</span>
                      <span className="panel-header-filename">{file1?.name || t('bpmn.originalFlow')}</span>
                    </div>
                    <div className="viewer-wrapper">
                      <BpmnViewer
                        xml={file1!.content}
                        highlightsRemoved={diffResult.removed}
                        highlightsModified={diffResult.modified.map(m => m.id)}
                        hoverHighlightId={hoveredId}
                        hoverHighlightColor={getHighlightColor(hoveredId)}
                        selectedId={selectedId}
                        selectedHighlightColor={getHighlightColor(selectedId)}
                        zoomRequest={zoomRequest}
                        onInit={(h) => { leftHandleRef.current = h; }}
                        onZoom={handleLeftZoom}
                        onViewboxChange={handleLeftViewboxChange}
                        onElementClick={handleElementClick}
                      />
                    </div>
                  </div>
                  <div className="panel bpmn-viewer-panel">
                    <div className="panel-header">
                      <span className="panel-header-label modified">{t('common.modified')}</span>
                      <span className="panel-header-filename">{file2?.name || t('bpmn.modifiedFlow')}</span>
                    </div>
                    <div className="viewer-wrapper">
                      <BpmnViewer
                        xml={file2!.content}
                        highlightsAdded={diffResult.added}
                        highlightsModified={diffResult.modified.map(m => m.id)}
                        hoverHighlightId={hoveredId}
                        hoverHighlightColor={getHighlightColor(hoveredId)}
                        selectedId={selectedId}
                        selectedHighlightColor={getHighlightColor(selectedId)}
                        zoomRequest={zoomRequest}
                        onInit={(h) => { rightHandleRef.current = h; }}
                        onZoom={handleRightZoom}
                        onViewboxChange={handleRightViewboxChange}
                        onElementClick={handleElementClick}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <IconDiagram className="icon-decorative" />
                <h3 className="text-header text-secondary">{t('common.readyToCompare')}</h3>
                <p className="text-body text-muted">{t('common.readyToCompareDesc')}</p>
              </div>
            )}
          </div>
          {showHelp && diffResult && (
            <>
              <NavigationHelp />
              <Legend />
            </>
          )}
          {showHistory && (
            <div className="panel floating-panel history-floating-panel" style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '320px',
              maxHeight: '80%',
              zIndex: 100,
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <HistoryPanel onSelect={handleHistorySelect} refreshKey={historyRefreshKey} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-left">
          <span className="text-xs text-muted">{t('common.appName')}</span>
        </div>
        <div className="footer-right">
          <button
            className="btn-secondary btn-compact btn-ghost"
            onClick={() => setShowAbout(true)}
            title={t('common.about')}
          >
            <IconInfo className="icon-sm" />
            <span>{t('common.version', { version })}</span>
          </button>
        </div>
      </footer>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} version={version} />}
    </div>
  );
};

export default App;
