import React from 'react';
import { X, Smartphone, Download, Share, PlusSquare, Monitor, CheckCircle, ExternalLink } from 'lucide-react';

export default function PWAInstallModal({ deferredPrompt, isOpen, onClose }) {
  if (!isOpen) return null;

  const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          onClose();
        }
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '480px', 
          width: '92%', 
          borderRadius: '1rem',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          backgroundColor: '#4f46e5', 
          color: '#ffffff', 
          padding: '1.5rem', 
          textAlign: 'center', 
          position: 'relative' 
        }}>
          <button 
            onClick={onClose}
            style={{ 
              position: 'absolute', 
              top: '1rem', 
              right: '1rem', 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              color: '#ffffff', 
              borderRadius: '50%', 
              width: '32px', 
              height: '32px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}
          >
            <X size={18} />
          </button>
          
          <div style={{ 
            width: '56px', 
            height: '56px', 
            backgroundColor: '#ffffff', 
            borderRadius: '1rem', 
            margin: '0 auto 0.75rem auto',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
          }}>
            <Smartphone size={32} color="#4f46e5" />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
            Install Customer App
          </h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>
            Install as a mobile app for fast offline access & full screen mode
          </p>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {deferredPrompt ? (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Your browser supports direct 1-tap installation. Click below to install immediately.
              </p>
              <button 
                onClick={handleNativeInstall}
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '0.85rem', 
                  fontSize: '1rem', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
                }}
              >
                <Download size={20} /> Direct Install Now
              </button>
            </div>
          ) : isIOS ? (
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 600, color: '#0369a1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={18} /> iPhone / iPad (Safari):
              </h4>
              <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#0c4a6e', lineHeight: '1.6' }}>
                <li>Tap the <strong>Share</strong> button <Share size={15} style={{ display: 'inline', verticalAlign: 'middle', color: '#0284c7' }} /> at the bottom of Safari.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare size={15} style={{ display: 'inline', verticalAlign: 'middle', color: '#0284c7' }} />.</li>
                <li>Tap <strong>Add</strong> at top right to complete install.</li>
              </ol>
            </div>
          ) : (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 600, color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Monitor size={18} /> Mobile & Browser Setup:
              </h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: '1.6', listStyleType: 'disc' }}>
                <li><strong>Chrome / Android:</strong> Tap the 3-dots menu <strong style={{ letterSpacing: '1px' }}>⋮</strong> ➔ select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</li>
                <li><strong>Desktop Chrome / Edge:</strong> Click the <strong>Install</strong> icon in the address bar at top right.</li>
              </ul>
            </div>
          )}

          {/* Benefits */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
              App Benefits
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} color="var(--success)" /> Instant launch
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} color="var(--success)" /> Full screen view
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} color="var(--success)" /> Offline support
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} color="var(--success)" /> Home screen icon
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button 
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
