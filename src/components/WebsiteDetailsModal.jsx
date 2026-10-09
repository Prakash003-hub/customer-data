import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  Info,
  Link as LinkIcon,
  Share2
} from 'lucide-react';
import FormattedContent from './FormattedContent';
import ShareDocumentsModal from './ShareDocumentsModal';
import { parseDocumentList } from '../utils/documentUtils';

export default function WebsiteDetailsModal({ website, onClose, onEdit, onDelete, showToast }) {
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!website) return null;

  const handleCopy = (url, label) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    if (showToast) showToast(`Copied ${label} link!`);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const docList = parseDocumentList(website.documentRequirements);

  const urlList = Array.isArray(website.urls) ? website.urls : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: '0.5rem', color: 'var(--primary-color)' }}>
              <Globe size={24} />
            </div>
            <div>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                color: 'var(--primary-color)',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                padding: '0.15rem 0.5rem',
                borderRadius: '0.25rem'
              }}>
                {website.category || 'General'}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {website.name}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              type="button"
              className="btn-icon" 
              onClick={() => setIsShareModalOpen(true)} 
              title="Share Document Requirements on WhatsApp"
              style={{ color: '#25D366' }}
            >
              <Share2 size={18} />
            </button>
            {onEdit && (
              <button className="btn-icon" onClick={() => { onClose(); onEdit(website); }} title="Edit Website">
                <Edit3 size={18} />
              </button>
            )}
            {onDelete && (
              <button className="btn-icon" onClick={() => { onClose(); onDelete(website); }} title="Delete Website" style={{ color: 'var(--danger)' }}>
                <Trash2 size={18} />
              </button>
            )}
            <button className="modal-close" onClick={onClose}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Description */}
          {website.description && (
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                ABOUT THIS PORTAL
              </h3>
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <FormattedContent content={website.description} />
              </div>
            </div>
          )}

          {/* Fee & Service Charge Cards */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', uppercase: true, marginBottom: '0.5rem' }}>
              FEE & CHARGES BREAKDOWN
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
              <div style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.06)', 
                border: '1px solid rgba(16, 185, 129, 0.25)', 
                padding: '0.85rem 1rem', 
                borderRadius: '0.6rem' 
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CreditCard size={15} /> GOVT / PAY FEE
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {website.payFee || 'Free / Included'}
                </div>
              </div>

              <div style={{ 
                backgroundColor: 'rgba(79, 70, 229, 0.06)', 
                border: '1px solid rgba(79, 70, 229, 0.25)', 
                padding: '0.85rem 1rem', 
                borderRadius: '0.6rem' 
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <DollarSign size={15} /> SERVICE CHARGES
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {website.charges || '₹0 Service Charge'}
                </div>
              </div>
            </div>
          </div>

          {/* Document Requirements Checklist */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.04em' }}>
                <FileText size={16} color="var(--primary-color)" />
                REQUIRED DOCUMENTS ({docList.length})
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {docList.length > 0 && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.6rem', borderRadius: '1rem' }}>
                    {docList.length} {docList.length === 1 ? 'Document' : 'Documents'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    borderRadius: '0.45rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Share Document Requirements on WhatsApp"
                >
                  <Share2 size={13} />
                  <span>Share List</span>
                </button>
              </div>
            </div>

            {docList.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.55rem' }}>
                {docList.map((doc, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.65rem', 
                      padding: '0.65rem 0.85rem', 
                      backgroundColor: '#ffffff', 
                      border: '1.5px solid #e2e8f0', 
                      borderRadius: '0.65rem',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
                    }}
                  >
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#059669',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <ShieldCheck size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                    <span style={{ wordBreak: 'break-word', flex: 1 }}>{doc}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                No specific document requirements listed.
              </p>
            )}
          </div>

          {/* Web URLs Links Section */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', uppercase: true, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <LinkIcon size={15} color="var(--primary-color)" />
              PORTAL ACCESS LINKS ({urlList.length})
            </h3>
            {urlList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {urlList.map((linkObj, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justify: 'space-between', 
                      padding: '0.75rem 1rem', 
                      backgroundColor: '#ffffff', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Globe size={15} color="var(--primary-color)" />
                        {linkObj.label || 'Web Link'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.1rem', wordBreak: 'break-all' }}>
                        {linkObj.url}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleCopy(linkObj.url, linkObj.label)}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', gap: '0.3rem' }}
                      >
                        {copiedUrl === linkObj.url ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                        <span>{copiedUrl === linkObj.url ? 'Copied' : 'Copy'}</span>
                      </button>

                      <a 
                        href={linkObj.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem' }}
                      >
                        Visit <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No links configured for this portal.
              </p>
            )}
          </div>

          {/* Notes / Instructions */}
          {website.notes && (
            <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '0.5rem', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Important Note:</strong> {website.notes}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsShareModalOpen(true)}
              style={{ color: '#15803d', borderColor: '#86efac', backgroundColor: '#f0fdf4', fontWeight: 600, gap: '0.35rem' }}
            >
              <Share2 size={15} /> Share Documents
            </button>
          </div>

          {urlList.length > 0 && (
            <a 
              href={urlList[0].url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary"
              style={{ fontWeight: 600, padding: '0.6rem 1.2rem' }}
            >
              Open Primary Portal <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Share Document Requirements Modal */}
      {isShareModalOpen && (
        <ShareDocumentsModal 
          website={website}
          onClose={() => setIsShareModalOpen(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
