import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  ShieldCheck, 
  Compass, 
  AlertCircle,
  ChevronUp,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { FileDropzone } from './components/upload/FileDropzone';
import { MapView } from './components/map/MapView';
import { PlaybackControls } from './components/controls/PlaybackControls';
import { TopDateHUD } from './components/hud/TopDateHUD';
import { WelcomeModal } from './components/welcome/WelcomeModal';
import { TimelineTutorialGuide } from './components/guide/TimelineTutorialGuide';
import { parseTimelineData } from './features/timeline/parser';
import { useJourneyAnimator } from './features/timeline/animator';
import type { Journey } from './types';
import './App.css';

function App() {
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Default camera in following marker mode
  const [followCamera, setFollowCamera] = useState<boolean>(true);
  const [targetZoom, setTargetZoom] = useState<number | null>(null);
  const [fitTrigger, setFitTrigger] = useState<number>(0);
  const [activeZoomPreset, setActiveZoomPreset] = useState<number | 'fit'>('fit');
  
  // Center screen "Reset to starting point" popup toast
  const [showResetToast, setShowResetToast] = useState<boolean>(false);
  const resetToastTimeoutRef = useRef<number | null>(null);

  // Minimize state for Timeline Visualizer box
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // 2D Unified Resizing: Width (Sideways) and Height/Scale (Up and Down)
  const [panelWidth, setPanelWidth] = useState<number | null>(null);
  const [panelScale, setPanelScale] = useState<number>(1);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const animator = useJourneyAnimator(journey, { baseDurationMs: 20000 });

  const handleDataLoaded = (data: any) => {
    setError(null);
    const result = parseTimelineData(data);
    if (result.success && result.journey) {
      setJourney(result.journey);
      setFollowCamera(true);
      setActiveZoomPreset(13);
      setTargetZoom(13);
    } else {
      setError(result.error || 'Failed to parse timeline data.');
    }
  };

  const handleSelectSample = (sample: Journey) => {
    setError(null);
    setJourney(sample);
    setFollowCamera(true);
    setActiveZoomPreset(13);
    setTargetZoom(13);
  };

  const handleReset = () => {
    animator.reset();
    setJourney(null);
    setError(null);
  };

  const handleRestart = () => {
    animator.restart();
    if (resetToastTimeoutRef.current) {
      window.clearTimeout(resetToastTimeoutRef.current);
    }
    setShowResetToast(true);
    resetToastTimeoutRef.current = window.setTimeout(() => {
      setShowResetToast(false);
    }, 2400);
  };

  useEffect(() => {
    return () => {
      if (resetToastTimeoutRef.current) {
        window.clearTimeout(resetToastTimeoutRef.current);
      }
    };
  }, []);

  const handleZoomPresetClick = (z: number) => {
    setActiveZoomPreset(z);
    setTargetZoom(z);
  };

  const handleFitRouteClick = () => {
    setActiveZoomPreset('fit');
    setTargetZoom(null);
    setFitTrigger(prev => prev + 1);
  };

  const handleUserDrag = () => {
    if (followCamera) {
      setFollowCamera(false);
    }
  };

  const handleToggleFollowCamera = () => {
    if (followCamera) {
      setFollowCamera(false);
      setActiveZoomPreset('fit');
      setTargetZoom(null);
      setFitTrigger(prev => prev + 1);
    } else {
      setFollowCamera(true);
      setActiveZoomPreset(13);
      setTargetZoom(13);
    }
  };

  // 2D Drag resize handler: 'width' (sideways), 'height' (up/down scale), or 'both' (corner)
  const startResizing = useCallback((mode: 'width' | 'height' | 'both', e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sidebarRef.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = panelWidth || sidebarRef.current.offsetWidth;
    const startScale = panelScale;

    setIsResizing(true);

    const handleMove = (moveEvent: MouseEvent | PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (mode === 'width') {
        const newWidth = Math.max(320, Math.min(620, startWidth + deltaX / startScale));
        setPanelWidth(Math.round(newWidth));
      } else if (mode === 'height') {
        const newScale = Math.max(0.65, Math.min(1.35, startScale + deltaY / 350));
        setPanelScale(Number(newScale.toFixed(2)));
      } else if (mode === 'both') {
        const newWidth = Math.max(320, Math.min(620, startWidth + deltaX / startScale));
        const newScale = Math.max(0.65, Math.min(1.35, startScale + deltaY / 400));
        setPanelWidth(Math.round(newWidth));
        setPanelScale(Number(newScale.toFixed(2)));
      }
    };

    const handleUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [panelWidth, panelScale]);

  const handleResetDimensions = () => {
    setPanelWidth(null);
    setPanelScale(1);
  };

  return (
    <div className="app-container">
      {/* Welcome Screen Pop-up on First Open */}
      {showWelcome && (
        <WelcomeModal onDismiss={() => setShowWelcome(false)} />
      )}

      {/* Map Layer */}
      <div className="map-container">
        <MapView 
          journey={journey}
          currentPosition={animator.interpolatedState.currentPosition}
          traveledPath={animator.interpolatedState.traveledPath}
          heading={animator.interpolatedState.heading}
          progress={animator.progress}
          followCamera={followCamera}
          targetZoom={targetZoom}
          fitTrigger={fitTrigger}
          onFitClick={handleFitRouteClick}
          onUserDrag={handleUserDrag}
        />
      </div>

      {/* Top Center Floating Date HUD (Exact 50% Top Center) */}
      {journey && (
        <TopDateHUD
          currentTimestamp={animator.interpolatedState.currentTimestamp}
          progress={animator.progress}
          status={animator.status}
        />
      )}

      {/* Center Screen "Reset to starting point" Popup Toast */}
      {showResetToast && (
        <div className="center-reset-toast">
          <div className="center-reset-toast-inner">
            <RotateCcw size={16} className="toast-icon" />
            <span>Reset to starting point</span>
          </div>
        </div>
      )}

      {/* Floating Sidebar UI with 2D Resizing (Box + Options Resized Together) & Minimize */}
      <div 
        ref={sidebarRef}
        className={`sidebar glass-panel ${isMinimized ? 'minimized' : ''} ${isResizing ? 'resizing' : ''} animate-fade-in`}
        style={{
          width: isMinimized ? undefined : (panelWidth ? `${panelWidth}px` : undefined),
          zoom: (!isMinimized && panelScale !== 1) ? panelScale : undefined
        }}
      >
        <div className="header">
          <div className="header-top-row">
            <div 
              className="header-title-group"
              onClick={isMinimized ? () => setIsMinimized(false) : undefined}
              style={{ cursor: isMinimized ? 'pointer' : 'default' }}
              title={isMinimized ? "Click to expand" : undefined}
            >
              <Compass className="text-gradient" size={24} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <div className="header-text">
                <h1 className="text-gradient">Timeline Visualizer</h1>
                {!isMinimized && <p>Google Maps Timeline & GPS Journey Animator</p>}
              </div>
            </div>

            <div className="header-actions">
              {isMinimized && journey && (
                <div 
                  className="minimized-pill-status" 
                  onClick={() => setIsMinimized(false)}
                  title="Click to expand"
                >
                  <span className="mini-dot" />
                  <span>{(animator.progress * 100).toFixed(0)}%</span>
                </div>
              )}
              <button
                className="sidebar-action-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand Timeline Box" : "Minimize Timeline Box"}
                aria-label={isMinimized ? "Expand Timeline Box" : "Minimize Timeline Box"}
              >
                {isMinimized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
            </div>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="sidebar-body animate-fade-in">
            {!journey ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '2px' }}>
                {error && (
                  <div className="error-message animate-fade-in">
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
                  </div>
                )}
                
                {/* Drag & Drop Area */}
                <FileDropzone onDataLoaded={handleDataLoaded} />
                
                {/* Interactive Location History Export Tutorial Guide */}
                <TimelineTutorialGuide onSelectSample={handleSelectSample} />

                {/* Privacy Assurance Card */}
                <div className="privacy-badge">
                  <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>100% Client-Side & Private:</strong> Your location JSON is processed entirely inside your browser. No coordinates or logs are ever uploaded to any server.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '2px' }}>
                {/* Playback & Statistics Controls (Unified Card) */}
                <PlaybackControls
                  journey={journey}
                  status={animator.status}
                  progress={animator.progress}
                  speed={animator.speed}
                  interpolatedState={animator.interpolatedState}
                  onTogglePlay={animator.togglePlay}
                  onRestart={handleRestart}
                  onSeek={animator.seek}
                  onSpeedChange={animator.setSpeed}
                  onReset={handleReset}
                  activeZoomPreset={activeZoomPreset}
                  onZoomPresetClick={handleZoomPresetClick}
                  onFitClick={handleFitRouteClick}
                  followCamera={followCamera}
                  onToggleFollowCamera={handleToggleFollowCamera}
                />
              </div>
            )}
          </div>
        )}

        {/* 2D Resize Handles: Right Edge (Width), Bottom Edge (Height), Corner (Both) */}
        {!isMinimized && (
          <>
            <div 
              className="sidebar-resize-edge-r"
              onPointerDown={(e) => startResizing('width', e)}
              onMouseDown={(e) => startResizing('width', e)}
              onDoubleClick={handleResetDimensions}
              title="Drag sideways to resize width (Double-click to reset)"
            />
            <div 
              className="sidebar-resize-edge-b"
              onPointerDown={(e) => startResizing('height', e)}
              onMouseDown={(e) => startResizing('height', e)}
              onDoubleClick={handleResetDimensions}
              title="Drag up/down to resize height (Double-click to reset)"
            />
            <div 
              className="sidebar-resize-handle"
              onPointerDown={(e) => startResizing('both', e)}
              onMouseDown={(e) => startResizing('both', e)}
              onDoubleClick={handleResetDimensions}
              title="Drag corner to resize sideways & up/down (Double-click to reset)"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.5 1.5L1.5 8.5M8.5 5L5 8.5M8.5 8.51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
