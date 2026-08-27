import { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { Maximize2, Layers } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Journey, GPSPoint } from '../../types';
import { getJourneyBounds } from '../../features/timeline/bounds';
import { MAP_THEMES, type MapTheme } from './mapThemes';
import './MapView.css';

// Directional pulsing marker with dynamic rotating heading pointer
const createDirectionalPulseIcon = (heading: number = 0) => {
  return L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div class="pulse-marker-wrapper">
        <div class="pulse-marker-outer-sonar"></div>
        <div class="pulse-marker-core-dot" style="transform: rotate(${heading}deg);">
          <div class="pulse-marker-heading-pointer"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Destination Logo / Pin Markers (Start: Green, Finish: Red)
const createDestinationMarkerIcon = (type: 'start' | 'end') => {
  const isStart = type === 'start';
  const colorTop = isStart ? '#22c55e' : '#ef4444';
  const colorBottom = isStart ? '#15803d' : '#b91c1c';
  const shadowColor = isStart ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)';
  const pulseColor = isStart ? '#22c55e' : '#ef4444';

  const innerSvg = `
    <circle cx="16" cy="14" r="5" fill="#ffffff" />
    <circle cx="16" cy="14" r="2.5" fill="${colorTop}" />
  `;

  return L.divIcon({
    className: `custom-destination-pin ${type}`,
    html: `
      <div class="destination-marker-container">
        <div class="destination-ground-pulse" style="--pulse-color: ${pulseColor};"></div>
        <svg class="destination-pin-svg" width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px ${shadowColor});">
          <defs>
            <linearGradient id="pin-grad-${type}" x1="16" y1="0" x2="16" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="${colorTop}" />
              <stop offset="100%" stop-color="${colorBottom}" />
            </linearGradient>
          </defs>
          <path d="M16 1C8.268 1 2 7.268 2 15C2 24.5 14.2 36.8 15.3 37.9C15.7 38.3 16.3 38.3 16.7 37.9C17.8 36.8 30 24.5 30 15C30 7.268 23.732 1 16 1Z" 
                fill="url(#pin-grad-${type})" 
                stroke="#ffffff" 
                stroke-width="1.8" 
                stroke-linejoin="round"
          />
          ${innerSvg}
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 39]
  });
};

const startMarkerIcon = createDestinationMarkerIcon('start');
const finishMarkerIcon = createDestinationMarkerIcon('end');

// Applies CSS filter to tile pane for color transformation (e.g. Apple Maps terrain look)
function TileFilter({ cssFilter }: { cssFilter?: string }) {
  const map = useMap();

  useEffect(() => {
    const tilePane = map.getPane('tilePane');
    if (tilePane) {
      tilePane.style.filter = cssFilter || 'none';
      tilePane.style.transition = 'filter 0.4s ease';
    }
    return () => {
      if (tilePane) {
        tilePane.style.filter = 'none';
      }
    };
  }, [cssFilter, map]);

  return null;
}

// Camera & view controller with ultra-smooth cinematic transitions
function MapController({
  journey,
  currentPosition,
  followCamera = true,
  targetZoom = null,
  fitTrigger = 0
}: {
  journey: Journey | null;
  currentPosition: GPSPoint | null;
  followCamera?: boolean;
  targetZoom?: number | null;
  fitTrigger?: number;
}) {
  const map = useMap();
  const lastJourneyKeyRef = useRef<string | null>(null);

  // Position camera directly at the starting point when a journey is uploaded or loaded
  useEffect(() => {
    if (!journey || journey.points.length === 0) return;

    const journeyKey = `${journey.points[0].lat.toFixed(4)}_${journey.points[0].lng.toFixed(4)}_${journey.points.length}`;
    if (lastJourneyKeyRef.current !== journeyKey) {
      lastJourneyKeyRef.current = journeyKey;
      const start = journey.points[0];
      map.setView([start.lat, start.lng], 13, { animate: false });
    }
  }, [journey, map]);

  // Handle explicit "Fit Route" overview button clicks
  useEffect(() => {
    if (fitTrigger > 0 && journey && journey.points.length > 0) {
      const bounds = getJourneyBounds(journey.points);
      if (bounds) {
        map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 16, duration: 1.0, easeLinearity: 0.25 });
      }
    }
  }, [fitTrigger, journey, map]);

  // Handle zoom preset changes (Fit, 9, 11, 13, 15)
  useEffect(() => {
    if (targetZoom !== null && targetZoom > 0) {
      const center = currentPosition 
        ? [currentPosition.lat, currentPosition.lng] as [number, number] 
        : (journey && journey.points.length > 0 ? [journey.points[0].lat, journey.points[0].lng] as [number, number] : map.getCenter());
      map.flyTo(center, targetZoom, { animate: true, duration: 0.8, easeLinearity: 0.25 });
    }
  }, [targetZoom, currentPosition, journey, map]);

  // Continuous smooth camera tracking when following marker
  useEffect(() => {
    if (followCamera && currentPosition) {
      map.setView([currentPosition.lat, currentPosition.lng], map.getZoom(), { animate: false });
    }
  }, [currentPosition, followCamera, map]);

  return null;
}

interface MapViewProps {
  journey: Journey | null;
  currentPosition?: GPSPoint | null;
  traveledPath?: [number, number][];
  heading?: number;
  progress?: number;
  followCamera?: boolean;
  targetZoom?: number | null;
  fitTrigger?: number;
  onFitClick?: () => void;
}

export function MapView({
  journey,
  currentPosition = null,
  traveledPath = [],
  heading = 0,
  progress = 0,
  followCamera = true,
  targetZoom = null,
  fitTrigger = 0,
  onFitClick
}: MapViewProps) {
  const [activeThemeId, setActiveThemeId] = useState<string>('dark');
  const currentTheme: MapTheme = MAP_THEMES[activeThemeId] || MAP_THEMES.dark;

  const startPoint = journey && journey.points.length > 0 ? journey.points[0] : null;
  const endPoint = journey && journey.points.length > 1 ? journey.points[journey.points.length - 1] : null;

  const dynamicMarkerIcon = useMemo(() => {
    return createDirectionalPulseIcon(heading);
  }, [heading]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // High-performance adaptive path renderer for massive (10,000+ km) cross-continental journeys
  const renderedPath = useMemo(() => {
    if (traveledPath.length <= 1000) return traveledPath;

    const total = traveledPath.length;
    const recentCount = 200; // Keep the active leading vehicle head at 100% micro-meter resolution
    const historicalCount = total - recentCount;
    const stride = Math.ceil(historicalCount / 700);

    const result: [number, number][] = [];
    for (let i = 0; i < historicalCount; i += stride) {
      result.push(traveledPath[i]);
    }
    for (let i = historicalCount; i < total; i++) {
      result.push(traveledPath[i]);
    }
    return result;
  }, [traveledPath]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Floating Map Theme Selector & Quick Actions */}
      <div className="map-floating-overlay">
        <div className="map-theme-pill">
          <Layers size={14} style={{ marginLeft: '6px', color: 'var(--text-secondary)' }} />
          {Object.values(MAP_THEMES).map((theme) => (
            <button
              key={theme.id}
              className={`theme-btn ${activeThemeId === theme.id ? 'active' : ''}`}
              onClick={() => setActiveThemeId(theme.id)}
              title={theme.name}
            >
              <span>{theme.icon}</span>
              <span className="theme-name">{theme.name}</span>
            </button>
          ))}
        </div>

        <div className="map-actions-bar">
          {journey && onFitClick && (
            <button
              className="map-action-btn"
              onClick={onFitClick}
              title="Fit entire route to screen"
            >
              <Maximize2 size={16} />
            </button>
          )}
          <button
            className="map-action-btn"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
          >
            ⛶
          </button>
        </div>
      </div>

      <MapContainer 
        center={[20, 0]} 
        zoom={3} 
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        preferCanvas={true}
        style={{ height: '100%', width: '100%', background: '#050510' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          key={currentTheme.id}
          url={currentTheme.url}
          attribution={currentTheme.attribution}
          subdomains={currentTheme.subdomains || ['a', 'b', 'c', 'd']}
        />

        {/* City and Street Labels Layer (e.g. for Midnight and Satellite) */}
        {currentTheme.referenceUrl && (
          <TileLayer
            key={`${currentTheme.id}-labels`}
            url={currentTheme.referenceUrl}
            attribution=""
            subdomains={currentTheme.subdomains || ['a', 'b', 'c', 'd']}
            zIndex={400}
          />
        )}

        {/* Apply CSS filter to tile pane for color transformation */}
        <TileFilter cssFilter={currentTheme.cssFilter} />

        {/* Multi-Layer Neon Glowing Traveled Route — only drawn during active playback/progress */}
        {renderedPath.length > 1 && progress > 0 && (
          <>
            <Polyline 
              positions={renderedPath} 
              pathOptions={{ 
                color: currentTheme.trackColors.neonGlow, 
                weight: 14,
                opacity: 0.5,
                lineCap: 'round',
                lineJoin: 'round'
              }} 
            />
            <Polyline 
              positions={renderedPath} 
              pathOptions={{ 
                color: currentTheme.trackColors.laserGlow, 
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round'
              }} 
            />
            <Polyline 
              positions={renderedPath} 
              pathOptions={{ 
                color: currentTheme.trackColors.coreLine, 
                weight: 2,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round'
              }} 
            />
          </>
        )}

        {/* Start Destination Pin (Green) and Finish Destination Pin (Red) */}
        {startPoint && (
          <Marker position={[startPoint.lat, startPoint.lng]} icon={startMarkerIcon} />
        )}
        {endPoint && (
          <Marker position={[endPoint.lat, endPoint.lng]} icon={finishMarkerIcon} />
        )}

        {/* Directional Animated Vehicle Navigation Marker */}
        {currentPosition && (
          <Marker 
            position={[currentPosition.lat, currentPosition.lng]} 
            icon={dynamicMarkerIcon} 
            zIndexOffset={1000}
          />
        )}

        <MapController 
          journey={journey} 
          currentPosition={currentPosition} 
          followCamera={followCamera}
          targetZoom={targetZoom}
          fitTrigger={fitTrigger}
        />
      </MapContainer>
    </div>
  );
}
