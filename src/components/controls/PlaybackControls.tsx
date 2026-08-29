import { Play, Pause, RotateCcw, Calendar, Maximize2, Eye, EyeOff } from 'lucide-react';
import type { AnimationStatus, InterpolatedState } from '../../features/timeline/animator';
import type { Journey } from '../../types';
import './PlaybackControls.css';

interface PlaybackControlsProps {
  journey: Journey;
  status: AnimationStatus;
  progress: number;
  speed: number;
  interpolatedState: InterpolatedState;
  onTogglePlay: () => void;
  onRestart: () => void;
  onSeek: (progress: number) => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
  activeZoomPreset?: number | 'fit';
  onZoomPresetClick?: (zoom: number) => void;
  onFitClick?: () => void;
  followCamera?: boolean;
  onToggleFollowCamera?: () => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 5, 10];
const ZOOM_PRESETS = [9, 11, 13, 15];

function formatDuration(ms: number | undefined): string {
  if (!ms || isNaN(ms) || ms <= 0) return 'Seketika / Titik Tunggal';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 365) {
    const years = (days / 365.25).toFixed(1);
    return `${years} thn (${days} hr)`;
  }
  if (days > 30) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    return `${months} bln ${remDays} hr`;
  }
  if (days > 0) {
    const remHours = hours % 24;
    return `${days} hr ${remHours} jam`;
  }
  if (hours > 0) {
    const remMins = minutes % 60;
    return `${hours} jam ${remMins} mnt`;
  }
  return `${minutes} menit`;
}

function formatDate(isoString: string | undefined): string {
  if (!isoString) return 'Tidak Diketahui';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'Tidak Diketahui';
  return d.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusLabel(status: AnimationStatus): string {
  switch (status) {
    case 'playing':
      return 'MEMUTAR';
    case 'paused':
      return 'JEDA';
    case 'completed':
      return 'SELESAI';
    case 'ready':
    case 'idle':
    default:
      return 'SIAP';
  }
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  journey,
  status,
  progress,
  speed,
  interpolatedState,
  onTogglePlay,
  onRestart,
  onSeek,
  onSpeedChange,
  onReset,
  activeZoomPreset = 'fit',
  onZoomPresetClick,
  onFitClick,
  followCamera = true,
  onToggleFollowCamera
}) => {
  const percentage = Math.round(progress * 100);
  const traveledKm = (interpolatedState.traveledDistanceMeters / 1000).toFixed(2);
  const totalKm = (journey.totalDistanceMeters / 1000).toFixed(2);
  const hasDateRange = Boolean(journey.startTime || journey.endTime);

  return (
    <div className="playback-controls animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className={`status-badge ${status}`}>
          <span className="status-dot" />
          {getStatusLabel(status)}
        </div>
        <button
          className="btn-control"
          onClick={onReset}
          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          title="Hapus / Muat berkas lain"
        >
          Ganti Berkas
        </button>
      </div>

      {/* Date Range History Box: Oldest -> Newest */}
      {hasDateRange && (
        <div className="date-range-box">
          <div className="date-range-header">
            <span className="date-range-title">
              <Calendar size={12} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              Rentang Waktu
            </span>
            <span className="date-range-duration">
              {formatDuration(journey.durationMs)}
            </span>
          </div>
          <div className="date-range-dates">
            <div className="date-item">
              <span className="date-tag oldest">Awal</span>
              <span style={{ fontWeight: 500 }}>{formatDate(journey.startTime)}</span>
            </div>
            <div className="date-item">
              <span className="date-tag newest">Akhir</span>
              <span style={{ fontWeight: 500 }}>{formatDate(journey.endTime)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Titik GPS</span>
          <span className="stat-value">{journey.points.length.toLocaleString('id-ID')}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Jarak</span>
          <span className="stat-value">
            {traveledKm} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>/ {totalKm} km</span>
          </span>
        </div>
      </div>

      {/* Progress Slider */}
      <div className="progress-section">
        <div className="progress-header">
          <span>Progres Linimasa</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{percentage}%</span>
        </div>
        <div className="progress-slider-container">
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="progress-slider"
          />
        </div>
      </div>

      {/* Play / Pause / Restart & Speed */}
      <div className="controls-row">
        <div className="action-buttons">
          <button className="btn-control primary" onClick={onTogglePlay}>
            {status === 'playing' ? <Pause size={16} /> : <Play size={16} />}
            {status === 'playing' ? 'Jeda' : 'Putar'}
          </button>
          <button className="btn-control" onClick={onRestart} title="Mulai ulang dari titik awal">
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="speed-selector">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              className={`speed-btn ${speed === s ? 'active' : ''}`}
              onClick={() => onSpeedChange(s)}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Base Zoom & Camera Toggle enclosed inside unified card */}
      <div className="zoom-controls-box">
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Zoom Dasar</span>
        <div className="zoom-btn-group">
          {onFitClick && (
            <button
              className={`zoom-btn ${activeZoomPreset === 'fit' ? 'active' : ''}`}
              onClick={onFitClick}
              title="Sesuaikan seluruh rute ke layar"
            >
              <Maximize2 size={11} style={{ display: 'inline', marginRight: '2px' }} />
              Pas
            </button>
          )}
          {ZOOM_PRESETS.map((z) => (
            <button
              key={z}
              className={`zoom-btn ${activeZoomPreset === z ? 'active' : ''}`}
              onClick={() => onZoomPresetClick?.(z)}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {onToggleFollowCamera && (
        <button
          className="btn-control"
          onClick={onToggleFollowCamera}
          style={{
            width: '100%',
            justifyContent: 'center',
            background: followCamera ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-tertiary)',
            borderColor: followCamera ? 'var(--accent-primary)' : 'var(--border-color)',
            fontSize: '0.8rem'
          }}
        >
          {followCamera ? <Eye size={15} style={{ color: 'var(--accent-primary)' }} /> : <EyeOff size={15} />}
          <span>{followCamera ? 'Kamera: Mengikuti Marker' : 'Kamera: Bebas Digeser (Klik untuk Mengikuti)'}</span>
        </button>
      )}
    </div>
  );
};
