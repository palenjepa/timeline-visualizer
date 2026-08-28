import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import './WelcomeModal.css';

interface WelcomeModalProps {
  onDismiss: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onDismiss }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onDismiss();
    }, 700); // match bounce-down & slide-up animation duration
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosing]);

  return (
    <div className={`welcome-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="welcome-backdrop" onClick={handleClose} />
      
      <div className={`welcome-card ${isClosing ? 'animate-welcome-lift-exit' : 'animate-welcome-entrance'}`}>
        {/* Ambient neon radial glow */}
        <div className="welcome-glow-ambient" />

        {/* Prominent Destination Logo with pulsating aura */}
        <div className="welcome-logo-container">
          <div className="welcome-pulse-ring ring-1" />
          <div className="welcome-pulse-ring ring-2" />
          
          <div className="welcome-destination-logo">
            <svg 
              className="welcome-pin-svg" 
              width="68" 
              height="82" 
              viewBox="0 0 32 40" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="welcome-pin-grad" x1="16" y1="0" x2="16" y2="38" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="welcome-pin-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#6366f1" floodOpacity="0.75" />
                </filter>
              </defs>
              <path 
                d="M16 1C8.268 1 2 7.268 2 15C2 24.5 14.2 36.8 15.3 37.9C15.7 38.3 16.3 38.3 16.7 37.9C17.8 36.8 30 24.5 30 15C30 7.268 23.732 1 16 1Z" 
                fill="url(#welcome-pin-grad)" 
                stroke="#ffffff" 
                strokeWidth="1.8" 
                strokeLinejoin="round"
                filter="url(#welcome-pin-glow)"
              />
              <circle cx="16" cy="14" r="5.5" fill="#ffffff" />
              <circle cx="16" cy="14" r="3" fill="#6366f1" />
            </svg>
            <div className="welcome-logo-compass-badge">
              <Compass size={15} className="compass-spin-icon" />
            </div>
          </div>
        </div>

        {/* Welcome Text Content */}
        <div className="welcome-header">
          <div className="welcome-badge">
            <Sparkles size={13} className="welcome-badge-icon" />
            <span>Google Maps Timeline & GPS Visualizer</span>
          </div>
          <h2 className="welcome-title text-gradient">
            Welcome to Timeline Visualizer
          </h2>
          <p className="welcome-desc">
            Transform your raw Google Maps Timeline, Takeout exports, and GPS location history into smooth, cinematic 60 FPS journey replays.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="welcome-features-grid">
          <div className="welcome-feature-item">
            <div className="welcome-feature-icon-box">
              <MapPin size={16} />
            </div>
            <div className="welcome-feature-text">
              <span className="welcome-feature-title">Cinematic Replays</span>
              <span className="welcome-feature-sub">Speed control & camera tracking</span>
            </div>
          </div>
          <div className="welcome-feature-item">
            <div className="welcome-feature-icon-box">
              <ShieldCheck size={16} />
            </div>
            <div className="welcome-feature-text">
              <span className="welcome-feature-title">100% Client-Side</span>
              <span className="welcome-feature-sub">Location data never leaves browser</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="welcome-actions">
          <button className="welcome-btn-primary" onClick={handleClose} autoFocus>
            <span>Get Started</span>
            <ArrowRight size={18} className="welcome-btn-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
};
