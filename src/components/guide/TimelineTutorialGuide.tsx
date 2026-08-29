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
          <span className="tutorial-title">Cara Mengekspor Data Linimasa Anda</span>
        </div>
        <span className="tutorial-subtitle">Pilih metode ekspor yang Anda inginkan di bawah ini:</span>
      </div>

      {/* Segmented Method Switcher */}
      <div className="tutorial-tab-switcher">
        <button
          className={`tutorial-tab-btn ${activeTab === 'mobile' ? 'active' : ''}`}
          onClick={() => setActiveTab('mobile')}
          type="button"
        >
          <Smartphone size={14} />
          <span>Aplikasi Google Maps</span>
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
            <span>Ekspor Langsung dari Ponsel (Android & iOS)</span>
          </div>

          <div className="tutorial-method-notice">
            <Info size={13} className="notice-icon" />
            <span>Gunakan metode ini hanya jika fitur Google Linimasa telah diaktifkan di aplikasi Anda.</span>
          </div>

          <div className="tutorial-steps-list">
            <div className="tutorial-step-card">
              <div className="step-number-badge">01</div>
              <div className="step-body">
                <span className="step-title">Buka Google Maps</span>
                <span className="step-desc">
                  Buka aplikasi <strong>Google Maps</strong> di ponsel cerdas atau tablet Anda.
                </span>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">02</div>
              <div className="step-body">
                <span className="step-title">Buka Linimasa Anda</span>
                <span className="step-desc">
                  Ketuk <strong>Foto Profil</strong> di pojok kanan atas, lalu pilih <strong>Linimasa Anda</strong>.
                </span>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">03</div>
              <div className="step-body">
                <span className="step-title">Buka Setelan & Privasi</span>
                <span className="step-desc">
                  Ketuk ikon menu <strong>••• (Tiga Titik)</strong> di pojok kanan atas → pilih <strong>Setelan dan privasi</strong>.
                </span>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">04</div>
              <div className="step-body">
                <span className="step-title">Ekspor Berkas JSON Linimasa</span>
                <span className="step-desc">
                  Gulir ke bawah ke menu <strong>"Ekspor data Linimasa"</strong> → ketuk <strong>Ekspor</strong> untuk menyimpan atau membagikan berkas <code>.json</code> ke komputer ini.
                </span>
              </div>
            </div>
          </div>

          <div className="tutorial-tip-box">
            <Share2 size={14} className="tip-icon" />
            <span>
              <strong>Tips Transfer Cepat:</strong> Gunakan AirDrop, email, Google Drive, atau kirim berkas JSON ke komputer ini, lalu seret langsung ke kotak unggah di atas!
            </span>
          </div>
        </div>
      )}

      {/* Method 2: Google Takeout Guide */}
      {activeTab === 'takeout' && (
        <div className="tutorial-method-content animate-fade-in">
          <div className="tutorial-badge takeout-badge">
            <CloudDownload size={12} />
            <span>Ekspor Arsip Cloud (Web / Komputer)</span>
          </div>

          <div className="tutorial-steps-list">
            <div className="tutorial-step-card">
              <div className="step-number-badge">01</div>
              <div className="step-body">
                <span className="step-title">Kunjungi Google Takeout</span>
                <span className="step-desc">
                  Buka halaman resmi ekspor arsip data Google di peramban Anda.
                </span>
                <a 
                  href="https://takeout.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="takeout-link-btn"
                >
                  <span>Buka takeout.google.com</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">02</div>
              <div className="step-body">
                <span className="step-title">Pilih Riwayat Lokasi</span>
                <span className="step-desc">
                  Klik <strong>"Batalkan pilihan semua"</strong>, lalu gulir ke bawah dan centang hanya <strong>"Histori Lokasi (Linimasa)"</strong>.
                </span>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">03</div>
              <div className="step-body">
                <span className="step-title">Buat Ekspor Sekali</span>
                <span className="step-desc">
                  Gulir ke bagian bawah, klik <strong>"Langkah berikutnya"</strong> → pilih <strong>"Ekspor sekali"</strong> (format .zip).
                </span>
              </div>
            </div>

            <div className="tutorial-step-card">
              <div className="step-number-badge">04</div>
              <div className="step-body">
                <span className="step-title">Ekstrak & Seret Records.json</span>
                <span className="step-desc">
                  Unduh arsip, ekstrak berkas <code>.zip</code>, lalu seret berkas <code>Records.json</code> atau berkas JSON bulanan dari folder <code>Semantic Location History</code> ke dalam kotak di atas.
                </span>
              </div>
            </div>
          </div>

          <div className="tutorial-tip-box">
            <FolderArchive size={14} className="tip-icon" />
            <span>
              <strong>Format yang Didukung:</strong> Mendukung format Takeout terbaru (<code>Records.json</code>) maupun berkas riwayat bulanan dari folder Semantic Location History.
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
              <span>Atau coba dengan rute demo siap pakai</span>
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
