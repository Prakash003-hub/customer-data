import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, UserPlus, Download, Smartphone, Clock, Globe } from 'lucide-react';

export default function Navbar() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (installed PWA)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window._pwaDeferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptObj = deferredPrompt || window._pwaDeferredPrompt;
    if (promptObj) {
      try {
        await promptObj.prompt();
        const { outcome } = await promptObj.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          window._pwaDeferredPrompt = null;
        }
      } catch (err) {
        console.error("Direct install error:", err);
      }
    } else {
      alert("Preparing native installer... Please tap 'Install' when the browser prompt appears.");
    }
  };

  return (
    <>
      {/* Top Main Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smartphone size={22} color="var(--primary-color)" />
            <span>Customer Management</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="nav-links desktop-nav" style={{ alignItems: 'center', gap: '1.25rem' }}>
            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="Install App"
              >
                <Download size={14} />
                <span>Install App</span>
              </button>
            )}

            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={18} /> Dashboard
              </span>
            </NavLink>

            <NavLink
              to="/add"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserPlus size={18} /> Add Data
              </span>
            </NavLink>

            <NavLink
              to="/updates"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={18} /> Updates
              </span>
            </NavLink>

            <NavLink
              to="/websites"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Globe size={18} /> Websites
              </span>
            </NavLink>
          </div>

          {/* Mobile Top Header Install Button */}
          <div className="mobile-header-actions" style={{ display: 'none' }}>
            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="btn btn-primary"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
              >
                <Download size={13} /> Install
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          end
        >
          <Users size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/add"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <UserPlus size={20} />
          <span>Add Data</span>
        </NavLink>

        <NavLink
          to="/updates"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <Clock size={20} />
          <span>Updates</span>
        </NavLink>

        <NavLink
          to="/websites"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <Globe size={20} />
          <span>Websites</span>
        </NavLink>
      </nav>
    </>
  );
}

