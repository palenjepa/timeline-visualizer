import React from 'react';
import { Clock } from 'lucide-react';
import type { AnimationStatus } from '../../features/timeline/animator';
import './TopDateHUD.css';

interface TopDateHUDProps {
  currentTimestamp?: string;
  progress: number;
  status: AnimationStatus;
}

function formatFullDate(isoString: string | undefined) {
  if (!isoString) return null;
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return null;

  const weekday = d.toLocaleDateString('id-ID', { weekday: 'long' });
  const day = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return { weekday, day, time };
}

export const TopDateHUD: React.FC<TopDateHUDProps> = ({
  currentTimestamp,
  progress,
  status
}) => {
  const dateInfo = formatFullDate(currentTimestamp);
  if (!dateInfo) return null;

  const percentage = Math.round(progress * 100);

  return (
    <div className="top-center-hud">
      <div className="hud-capsule">
        <div className="hud-icon-wrap">
          <Clock size={15} style={{ color: 'var(--accent-primary)' }} />
          {status === 'playing' && <span className="hud-live-dot" />}
        </div>

        <div className="hud-content">
          <div className="hud-title-row">
            <span className="hud-label">TANGGAL & WAKTU POSISI SAAT INI</span>
          </div>
          <div className="hud-date-row">
            <span className="hud-date">{dateInfo.weekday}, {dateInfo.day}</span>
            <span className="hud-time-tag">{dateInfo.time}</span>
          </div>
        </div>

        <div className="hud-progress-tag" title="Progres Linimasa">
          <span className={`hud-progress-dot ${status === 'playing' ? 'active' : ''}`} />
          <span>{percentage}%</span>
        </div>
      </div>
    </div>
  );
};
