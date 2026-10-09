import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Phone, 
  FileText, 
  Sparkles, 
  RotateCcw, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { parseDocumentList } from '../utils/documentUtils';

// SVG WhatsApp Icon for crisp branding
const WhatsAppIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.37C16.31 14.24 15.09 13.64 14.86 13.56C14.63 13.47 14.47 13.43 14.3 13.68C14.14 13.93 13.67 14.48 13.53 14.64C13.39 14.81 13.24 14.83 13 14.7C12.75 14.58 11.96 14.32 11.02 13.48C10.29 12.83 9.8 12.03 9.65 11.78C9.51 11.53 9.64 11.4 9.76 11.27C9.87 11.16 10.01 10.98 10.13 10.83C10.26 10.69 10.3 10.58 10.38 10.42C10.46 10.25 10.42 10.11 10.36 9.98C10.3 9.86 9.8 8.64 9.6 8.14C9.4 7.66 9.2 7.72 9.05 7.72C8.91 7.71 8.75 7.71 8.58 7.71C8.42 7.71 8.15 7.77 7.92 8.02C7.7 8.27 7.07 8.86 7.07 10.06C7.07 11.27 7.95 12.43 8.07 12.59C8.2 12.76 9.8 15.22 12.24 16.27C12.82 16.52 13.27 16.67 13.63 16.78C14.21 16.97 14.74 16.94 15.16 16.88C15.63 16.81 16.6 16.29 16.81 15.71C17.01 15.13 17.01 14.64 16.95 14.53C16.89 14.43 16.8 14.49 16.56 14.37Z" />
  </svg>
);

export default function ShareDocumentsModal({ website, onClose, showToast }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [includeFees, setIncludeFees] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  if (!website) return null;

  const docList = useMemo(() => {
    return parseDocumentList(website.documentRequirements);
  }, [website.documentRequirements]);

  // Generate message matching exact Tamil pattern:
  // "நீங்கள் ( Web / Portal Name *) விண்ணப்பம் செய்ய கீழே உள்ளனவை வைத்திருக்க வேண்டும் ... (Document Requirements)"
  const generatedMessage = useMemo(() => {
    let msg = `நீங்கள் *(${website.name})* விண்ணப்பம் செய்ய கீழே உள்ளனவை வைத்திருக்க வேண்டும்:\n\n`;
    msg += `📋 *தேவையான ஆவணங்கள் (Required Documents):*\n`;

    if (docList && docList.length > 0) {
      docList.forEach((doc, idx) => {
        msg += `${idx + 1}. ${doc}\n`;
      });
    } else {
      msg += `• ஆவணங்கள் எதுவும் குறிப்பிடப்படவில்லை (No specific documents listed)\n`;
    }

    if (includeFees && (website.payFee || website.charges)) {
      msg += `\n💳 *கட்டணம் விபரம் (Fee Details):*\n`;
      if (website.payFee) msg += `• அரசு கட்டணம் (Govt Fee): ${website.payFee}\n`;
      if (website.charges) msg += `• சேவை கட்டணம் (Charges): ${website.charges}\n`;
    }

    if (includeNotes && website.notes) {
      msg += `\n📌 *முக்கிய குறிப்பு (Note):*\n${website.notes}\n`;
    }

    msg += `\n🙏 நன்றி! / Thank you!`;
    return msg;
  }, [website, docList, includeFees, includeNotes]);

  // Keep custom message in sync with options unless manually edited
  useEffect(() => {
    if (!isEditingMessage) {
      setCustomMessage(generatedMessage);
    }
  }, [generatedMessage, isEditingMessage]);

  const activeMessage = customMessage || generatedMessage;

  // Format clean phone number (handle Indian 10-digit or international format)
  const getCleanPhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    // If exactly 10 digits, assume India (+91)
    if (digits.length === 10) {
      return `91${digits}`;
    }
    // If starts with 0 and has 11 digits, strip leading 0 and add 91
    if (digits.length === 11 && digits.startsWith('0')) {
      return `91${digits.slice(1)}`;
    }
    return digits;
  };

  const handleShareWhatsApp = (e) => {
    e?.preventDefault();
    const encoded = encodeURIComponent(activeMessage);
    const cleanPhone = getCleanPhone(phoneNumber);

    let url = '';
    if (cleanPhone) {
      url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    } else {
      // Allows selecting contact in WhatsApp directly
      url = `https://api.whatsapp.com/send?text=${encoded}`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    if (showToast) {
      showToast(cleanPhone ? `Opening WhatsApp for +${cleanPhone}...` : 'Opening WhatsApp to choose contact...');
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(activeMessage);
      setCopied(true);
      if (showToast) showToast('Documents list copied to clipboard!');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${website.name} - Required Documents`,
          text: activeMessage
        });
        if (showToast) showToast('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyMessage();
        }
      }
    } else {
      handleCopyMessage();
    }
  };

  const handleResetMessage = () => {
    setIsEditingMessage(false);
    setCustomMessage(generatedMessage);
    if (showToast) showToast('Message reset to default template');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '580px', borderRadius: '1rem', overflow: 'hidden' }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          className="modal-header" 
          style={{ 
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', 
            color: '#ffffff',
            padding: '1.15rem 1.4rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '0.65rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              backdropFilter: 'blur(8px)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <WhatsAppIcon size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Share Document Requirements
                </h2>
                <span style={{ 
                  fontSize: '0.68rem', 
                  fontWeight: 700, 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '1rem',
                  letterSpacing: '0.02em'
                }}>
                  WhatsApp
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)', margin: '0.15rem 0 0 0' }}>
                ஆவண தேவைகளை வாடிக்கையாளருக்கு பகிரவும்
              </p>
            </div>
          </div>

          <button 
            type="button"
            className="modal-close" 
            onClick={onClose} 
            style={{ color: '#ffffff', opacity: 0.9 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* Portal Information Chip */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0.65rem 0.95rem', 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '0.75rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--primary-color)" />
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Portal / Service Name
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {website.name}
                </div>
              </div>
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: '#059669', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              padding: '0.2rem 0.6rem', 
              borderRadius: '1rem' 
            }}>
              {docList.length} {docList.length === 1 ? 'Document' : 'Documents'}
            </div>
          </div>

          {/* WhatsApp Mobile Number Input Box (whatsapp no entry) */}
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#f0fdf4', 
            border: '1.5px solid #bbf7d0', 
            borderRadius: '0.85rem' 
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: '#166534', 
              marginBottom: '0.45rem' 
            }}>
              <Phone size={15} />
              <span>WhatsApp Mobile No Entry (வாட்ஸ்அப் எண்):</span>
            </label>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0 0.75rem', 
                backgroundColor: '#ffffff', 
                border: '1.5px solid #86efac', 
                borderRadius: '0.55rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#15803d'
              }}>
                🇮🇳 +91
              </div>

              <input 
                type="tel"
                className="form-input"
                placeholder="Enter 10-digit WhatsApp number (e.g. 9876543210)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleShareWhatsApp();
                  }
                }}
                style={{ 
                  flex: 1, 
                  borderColor: '#86efac', 
                  backgroundColor: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.92rem'
                }}
                autoFocus
              />

              {phoneNumber && (
                <button 
                  type="button" 
                  onClick={() => setPhoneNumber('')}
                  style={{ 
                    padding: '0 0.6rem', 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    cursor: 'pointer' 
                  }}
                  title="Clear number"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.4rem', lineHeight: 1.4 }}>
              💡 <strong>குறிப்பு:</strong> எண் உள்ளீடு செய்தால் நேரடி அரட்டை திறக்கும். எண் வழங்காவிட்டால் WhatsApp தொடர்பு பட்டியல் திறக்கும்.
            </p>
          </div>

          {/* Quick Customization Toggles */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
            {(website.payFee || website.charges) && (
              <label style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: 'var(--text-main)', 
                cursor: 'pointer',
                backgroundColor: '#f8fafc',
                padding: '0.35rem 0.65rem',
                borderRadius: '0.45rem',
                border: '1px solid #e2e8f0'
              }}>
                <input 
                  type="checkbox" 
                  checked={includeFees} 
                  onChange={(e) => setIncludeFees(e.target.checked)} 
                  style={{ cursor: 'pointer' }}
                />
                <span>Include Fees / கட்டணம் விபரம்</span>
              </label>
            )}

            {website.notes && (
              <label style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: 'var(--text-main)', 
                cursor: 'pointer',
                backgroundColor: '#f8fafc',
                padding: '0.35rem 0.65rem',
                borderRadius: '0.45rem',
                border: '1px solid #e2e8f0'
              }}>
                <input 
                  type="checkbox" 
                  checked={includeNotes} 
                  onChange={(e) => setIncludeNotes(e.target.checked)} 
                  style={{ cursor: 'pointer' }}
                />
                <span>Include Notes / குறிப்பு</span>
              </label>
            )}

            {isEditingMessage && (
              <button 
                type="button" 
                onClick={handleResetMessage}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.3rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: 'var(--primary-color)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                <RotateCcw size={12} /> Reset to Default Template
              </button>
            )}
          </div>

          {/* Message Preview & Edit Box */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                color: 'var(--text-muted)', 
                textTransform: 'uppercase', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem' 
              }}>
                <MessageSquare size={14} color="var(--primary-color)" />
                WhatsApp Message Preview (முன்னோட்டம்)
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                You can edit text before sharing
              </span>
            </div>

            <textarea 
              className="form-input"
              rows={7}
              value={customMessage}
              onChange={(e) => {
                setIsEditingMessage(true);
                setCustomMessage(e.target.value);
              }}
              style={{ 
                fontFamily: 'inherit',
                fontSize: '0.85rem', 
                lineHeight: '1.5', 
                resize: 'vertical',
                backgroundColor: '#f8fafc',
                borderColor: '#e2e8f0',
                borderRadius: '0.65rem',
                padding: '0.75rem 0.85rem'
              }}
            />
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div style={{ 
          padding: '1rem 1.4rem', 
          backgroundColor: '#f8fafc', 
          borderTop: '1px solid var(--border-color)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleCopyMessage}
              style={{ fontSize: '0.825rem', gap: '0.35rem', padding: '0.5rem 0.85rem' }}
              title="Copy message to clipboard"
            >
              {copied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleNativeShare}
                style={{ fontSize: '0.825rem', gap: '0.35rem', padding: '0.5rem 0.85rem' }}
                title="Share using device share menu"
              >
                <Share2 size={15} />
                <span>Share...</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{ fontSize: '0.825rem', padding: '0.5rem 0.95rem' }}
            >
              Cancel
            </button>

            <button 
              type="button" 
              onClick={handleShareWhatsApp}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.55rem 1.25rem', 
                backgroundColor: '#25D366', 
                color: '#ffffff', 
                borderRadius: 'var(--radius-md)', 
                fontWeight: 700, 
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1ebd5a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
            >
              <WhatsAppIcon size={18} color="#ffffff" />
              <span>{phoneNumber.trim() ? 'Send on WhatsApp' : 'Open WhatsApp'}</span>
              <Send size={14} style={{ marginLeft: '2px' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
