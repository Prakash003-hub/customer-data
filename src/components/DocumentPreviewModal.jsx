import React, { useState } from 'react';
import { X, ExternalLink, Download, FileText, Image as ImageIcon, RefreshCw, AlertTriangle } from 'lucide-react';

export default function DocumentPreviewModal({ doc, onClose }) {
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!doc) return null;

  // Extract Drive File ID from document object or URL
  const getDriveFileId = (document) => {
    if (document.DriveFileID) return document.DriveFileID;
    if (document.driveFileId) return document.driveFileId;
    if (document.DriveURL) {
      const match = document.DriveURL.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) return match[1];
      const idParam = document.DriveURL.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idParam) return idParam[1];
    }
    return null;
  };

  const fileId = getDriveFileId(doc);
  const fileName = doc.FileName || doc.name || 'Document';
  const mimeType = doc.MimeType || doc.mimeType || '';
  const ext = fileName.split('.').pop().toLowerCase();

  const isImage = mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);

  // URLs for viewing
  const driveViewUrl = doc.DriveURL || (fileId ? `https://drive.google.com/file/d/${fileId}/view?usp=sharing` : '#');
  const drivePreviewUrl = doc.PreviewURL || (fileId ? `https://drive.google.com/file/d/${fileId}/preview` : driveViewUrl);
  const directImageUrl = doc.DirectURL || (fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : driveViewUrl);
  const directDownloadUrl = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : driveViewUrl;

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }} onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '900px', 
          width: '95%', 
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#111827',
          color: '#f9fafb'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          padding: '1rem 1.5rem', 
          borderBottom: '1px solid #374151',
          backgroundColor: '#1f2937'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            {isImage ? <ImageIcon size={22} style={{ color: '#818cf8', flexShrink: 0 }} /> : <FileText size={22} style={{ color: '#818cf8', flexShrink: 0 }} />}
            <span style={{ fontWeight: 600, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fileName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {driveViewUrl && (
              <a 
                href={driveViewUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#374151', color: '#f3f4f6', borderColor: '#4b5563' }}
                title="Open directly in Google Drive"
              >
                <ExternalLink size={15} /> Open in Drive
              </a>
            )}
            
            {fileId && (
              <a 
                href={directDownloadUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#374151', color: '#f3f4f6', borderColor: '#4b5563' }}
                title="Download file"
              >
                <Download size={15} /> Download
              </a>
            )}

            <button 
              className="modal-close" 
              onClick={onClose} 
              style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justify: 'center', 
          padding: '1rem',
          minHeight: '400px',
          maxHeight: 'calc(92vh - 120px)',
          overflow: 'auto',
          backgroundColor: '#0f172a'
        }}>
          {!fileId ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
              <AlertTriangle size={48} style={{ marginBottom: '1rem', color: '#f59e0b' }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Preview unavailable for this document.</p>
              <a 
                href={driveViewUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                <ExternalLink size={16} /> Try Opening in Google Drive
              </a>
            </div>
          ) : isImage && !useIframeFallback && !imageError ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={directImageUrl} 
                alt={fileName}
                onError={() => setImageError(true)}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '70vh', 
                  objectFit: 'contain', 
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
              />
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setUseIframeFallback(true)}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', backgroundColor: '#374151', color: '#d1d5db', border: 'none' }}
                >
                  <RefreshCw size={14} /> Switch to Drive Viewer
                </button>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '72vh', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <iframe 
                src={drivePreviewUrl}
                title={fileName}
                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#ffffff' }}
                allow="autoplay"
              />
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div style={{ 
          padding: '0.75rem 1.5rem', 
          backgroundColor: '#1f2937', 
          borderTop: '1px solid #374151',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          color: '#9ca3af'
        }}>
          <span>Document: <strong>{fileName}</strong></span>
          <span>If preview does not load, ensure Google Drive file permissions are set to Anyone with link.</span>
        </div>
      </div>
    </div>
  );
}
