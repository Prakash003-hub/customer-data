import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = async (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window._pwaDeferredPrompt = e;

      if (!isStandalone) {
        setShowPrompt(true);
        // Direct automatic native install prompt trigger on load
        try {
          await e.prompt();
          const { outcome } = await e.userChoice;
          if (outcome === 'accepted') {
            setShowPrompt(false);
            setDeferredPrompt(null);
          }
        } catch (err) {
          console.log("Native prompt waiting for user interaction");
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Direct auto-trigger on first user tap/click on screen
    const handleFirstTouch = async () => {
      const promptObj = window._pwaDeferredPrompt || deferredPrompt;
      if (promptObj && !isStandalone) {
        try {
          await promptObj.prompt();
          const { outcome } = await promptObj.userChoice;
          if (outcome === 'accepted') {
            setShowPrompt(false);
          }
        } catch (err) { }
      }
    };

    window.addEventListener('click', handleFirstTouch, { once: true });
    window.addEventListener('touchstart', handleFirstTouch, { once: true });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstGesture => { });
    };
  }, [isStandalone, deferredPrompt]);

  const handleDirectInstall = async () => {
    const promptObj = deferredPrompt || window._pwaDeferredPrompt;
    if (promptObj) {
      setIsInstalling(true);
      try {
        await promptObj.prompt();
        const { outcome } = await promptObj.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
          setDeferredPrompt(null);
          window._pwaDeferredPrompt = null;
        }
      } catch (err) {
        console.error("Install prompt error:", err);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Trigger native browser install action if available
      alert("Browser preparing native install... Please tap Install on the popup prompt.");
    }
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div
      className="pwa-install-prompt-overlay"
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 2rem)',
        maxWidth: '460px',
        backgroundColor: '#111827',
        color: '#ffffff',
        padding: '1.25rem',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        zIndex: 9999,
        border: '1px solid #374151',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '0.75rem',
            backgroundColor: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
            flexShrink: 0
          }}>
            <Smartphone size={26} color="#ffffff" />
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0, color: '#ffffff' }}>
              Install Customer App
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>
              Direct 1-Click Native Installation
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPrompt(false)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#9ca3af',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justify: 'center'
          }}
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      <button
        onClick={handleDirectInstall}
        className="btn"
        disabled={isInstalling}
        style={{
          width: '100%',
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.95rem',
          padding: '0.75rem 1rem',
          border: 'none',
          borderRadius: '0.6rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
        }}
      >
        <Download size={18} /> {isInstalling ? 'Installing...' : 'Install Now'}
      </button>
    </div>
  );
}
