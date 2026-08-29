import React, { useState } from 'react';
import { 
  Smartphone, 
  CloudDownload, 
  ExternalLink, 
  Sparkles, 
  MapPin, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FolderArchive,
  Share2,
  Info
} from 'lucide-react';
import { ALL_SAMPLES, type SampleJourney } from '../../data/sample';
import './TimelineTutorialGuide.css';

interface TimelineTutorialGuideProps {
  onSelectSample?: (sample: SampleJourney) => void;
}

export const TimelineTutorialGuide: React.FC<TimelineTutorialGuideProps> = ({ onSelectSample }) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'takeout'>('mobile');
  const [showSamples, setShowSamples] = useState(false);

  return (
    <div className="tutorial-guide-container animate-fade-in">
      {/* Header */}
      <div className="tutorial-header">
        <div className="tutorial-title-row">
          <HelpCircle size={15} className="tutorial-header-icon" />
          <span className="tutorial-title">How to Export Your Timeline Data</span>
        </div>
        <span className="tutorial-subtitle">Choose your preferred export method below:</span>
      </div>

      {/* Segmented Method Switcher */}
      <div className="tutorial-tab-switcher">
        <button
          className={`tutorial-tab-btn ${activeTab === 'mobile' ? 'active' : ''}`}
          onClick={() => setActiveTab('mobile')}
          type="button"
        >
          <Smartphone size={14} />
          <span>Google Maps App</span>
        </button>
        <button
          className={`tutorial-tab-btn ${activeTab === 'takeout' ? 'active' : ''}`}
          onClick={() => setActiveTab('takeout')}
          type="button"
        >
          <CloudDownload size={14} />
          <span>Google Takeout</span>
        </button>
      </div>

      {/* Method 1: Google Maps Mobile App Guide */}
      {activeTab === 'mobile' && (
        <div className="tutorial-method-content animate-fade-in">
          <div className="tutorial-badge mobile-badge">
            <Smartphone size={12} />
            <span>On-Device Mobile Export (Android & iOS)</span>
          </div>

          <div className="tutorial-method-notice">
            <Info size={13} className="notice-icon" />
            <span>Only use this method if you have Google Timeline enabled in your app.</span>
          </div>

          <div className="tutorial-steps-list">
            <div className="tutorial-step-card">
              <div className="step-number-badge">01</div>
              <div className="step-body">
                <span className="step-title">Open Google Maps</span>
                <span className="step-desc">
                  Launch the <strong>Google Maps</strong> app on your smartphone or tablet.
                </span>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">02</div>
              <div className="step-body">
                <span className="step-title">Navigate to Your Timeline</span>
                <span className="step-desc">
                  Tap your <strong>Profile Picture</strong> at the top right, then select <strong>Your Timeline</strong>.
                </span>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">03</div>
              <div className="step-body">
                <span className="step-title">Open Settings & Privacy</span>
                <span className="step-desc">
                  Tap the <strong>••• (Three Dots)</strong> menu icon in the top right → tap <strong>Settings and privacy</strong>.
                </span>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">04</div>
              <div className="step-body">
                <span className="step-title">Export Timeline JSON</span>
                <span className="step-desc">
                  Scroll down to <strong>"Export Timeline data"</strong> → tap <strong>Export</strong> to save or share your <code>.json</code> file to this computer.
                </span>
              </div>
            </div>
          </div>

          <div className="tutorial-tip-box">
            <Share2 size={14} className="tip-icon" />
            <span>
              <strong>Quick Transfer Tip:</strong> AirDrop, email, or save the exported JSON to Google Drive/iCloud, then drag it directly into the box above!
            </span>
          </div>
        </div>
      )}

      {/* Method 2: Google Takeout Guide */}
      {activeTab === 'takeout' && (
        <div className="tutorial-method-content animate-fade-in">
          <div className="tutorial-badge takeout-badge">
            <CloudDownload size={12} />
            <span>Cloud Archive Export (Desktop Web)</span>
          </div>

          <div className="tutorial-steps-list">
            <div className="tutorial-step-card">
              <div className="step-number-badge">01</div>
              <div className="step-body">
                <span className="step-title">Go to Google Takeout</span>
                <span className="step-desc">
                  Open Google's official data archive export page in your browser.
                </span>
                <a 
                  href="https://takeout.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="takeout-link-btn"
                >
                  <span>Open takeout.google.com</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">02</div>
              <div className="step-body">
                <span className="step-title">Select Location History</span>
                <span className="step-desc">
                  Click <strong>"Deselect all"</strong>, then scroll down and check only <strong>"Location History (Timeline)"</strong>.
                </span>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">03</div>
              <div className="step-body">
                <span className="step-title">Create Single Export</span>
                <span className="step-desc">
                  Scroll to the bottom, click <strong>"Next step"</strong> → choose <strong>"Export once"</strong> (.zip format).
                </span>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">04</div>
              <div className="step-body">
                <span className="step-title">Extract & Drop Records.json</span>
                <span className="step-desc">
                  Download the archive, extract the <code>.zip</code>, and drag <code>Records.json</code> or any monthly JSON file from <code>Semantic Location History</code> into the box above.
                </span>
              </div>
            </div>
          </div>

          <div className="tutorial-tip-box">
            <FolderArchive size={14} className="tip-icon" />
            <span>
              <strong>Supported Formats:</strong> Works with both modern Takeout format (<code>Records.json</code>) and Semantic Location History month/year files.
            </span>
          </div>
        </div>
      )}

      {/* Optional Collapsible Demo Routes Section */}
      {onSelectSample && (
        <div className="demo-routes-drawer">
          <button 
            className="demo-routes-toggle-btn"
            onClick={() => setShowSamples(!showSamples)}
            type="button"
          >
            <div className="toggle-label-group">
              <Sparkles size={13} className="sparkle-icon" />
              <span>Or try with preloaded demo routes</span>
            </div>
            {showSamples ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showSamples && (
            <div className="demo-routes-dropdown animate-fade-in">
              <div className="sample-cards-list">
                {ALL_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    className="sample-card"
                    onClick={() => onSelectSample(sample)}
                    type="button"
                  >
                    <div className="sample-card-info">
                      <span className="sample-card-title">{sample.title}</span>
                      <span className="sample-card-desc">{sample.description}</span>
                    </div>
                    <MapPin size={15} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
