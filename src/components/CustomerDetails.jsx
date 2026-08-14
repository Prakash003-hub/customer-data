import React, { useState, useEffect } from 'react';
import { X, FileText, ExternalLink, Eye, Phone, MessageCircle, Edit2, Trash2, Save, Image as ImageIcon, Download } from 'lucide-react';
import { api } from '../services/api';
import Loader from './Loader';
import DocumentUploader from './DocumentUploader';
import DocumentPreviewModal from './DocumentPreviewModal';

export default function CustomerDetails({ customer, onClose, onRefresh }) {
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [documents, setDocuments] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error, setError] = useState('');
  
  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...customer });
  const [isSaving, setIsSaving] = useState(false);
  
  // New documents to upload during edit
  const [newDocuments, setNewDocuments] = useState([]);
  
  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getDriveFileId = (doc) => {
    if (!doc) return null;
    if (doc.DriveFileID) return doc.DriveFileID;
    if (doc.driveFileId) return doc.driveFileId;
    if (doc.DriveURL) {
      const match = doc.DriveURL.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) return match[1];
      const idParam = doc.DriveURL.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idParam) return idParam[1];
    }
    return null;
  };

  const getDownloadUrl = (doc) => {
    if (!doc) return '#';
    if (doc.base64) return doc.base64;
    const fileId = getDriveFileId(doc);
    if (fileId) return `https://drive.google.com/uc?export=download&id=${fileId}`;
    return doc.DriveURL || doc.url || '#';
  };

  const handleDownloadSingleDoc = (doc) => {
    const url = getDownloadUrl(doc);
    const fileName = doc.FileName || doc.name || 'document';
    
    if (doc.base64) {
      const a = document.createElement('a');
      a.href = doc.base64;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert("Download link unavailable for this document.");
    }
  };

  const handleDownloadAllDocuments = () => {
    if (!documents || documents.length === 0) return;
    
    documents.forEach((doc, index) => {
      setTimeout(() => {
        handleDownloadSingleDoc(doc);
      }, index * 400);
    });
  };

  const handleViewDocuments = React.useCallback(async () => {
    if (!customer?.CustomerID) return;
    setLoadingDocs(true);
    setError('');
    
    try {
      const result = await api.getCustomerDocuments(customer.CustomerID);
      if (result.success) {
        setDocuments(result.data);
      } else {
        setError(result.error || 'Failed to load documents');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDocs(false);
    }
  }, [customer?.CustomerID]);

  useEffect(() => {
    if (customer && customer.CustomerID) {
      handleViewDocuments();
    }
  }, [customer, handleViewDocuments]);

  const handleEditClick = () => {
    setIsEditing(true);
    if (!documents && !loadingDocs) {
      handleViewDocuments();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const result = await api.updateCustomer(customer.CustomerID, formData);
      if (result.success) {
        
        // Upload new documents if any
        if (newDocuments.length > 0) {
          const uploadRes = await api.uploadDocuments(customer.CustomerID, newDocuments, formData.Name);
          if (!uploadRes.success) {
            setError(uploadRes.error || 'Customer updated, but failed to upload new documents.');
            setIsSaving(false);
            return;
          }
        }
        
        setIsEditing(false);
        setNewDocuments([]);
        // Force refresh of documents if we just uploaded some
        handleViewDocuments();
        if (onRefresh) onRefresh();
      } else {
        setError(result.error || 'Failed to update customer');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      const result = await api.deleteCustomer(customer.CustomerID);
      if (result.success) {
        onClose(); // Close modal on successful delete
        if (onRefresh) onRefresh();
      } else {
        setError(result.error || 'Failed to delete customer');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to permanently delete this document?")) return;
    
    try {
      const result = await api.deleteDocument(docId);
      if (result.success) {
        // Remove from local state
        setDocuments(prev => prev.filter(d => (d.DocumentID || d.documentId) !== docId));
      } else {
        const errMsg = result.error || 'Failed to delete document';
        setError(errMsg);
        alert("Delete Failed: " + errMsg);
      }
    } catch (err) {
      setError(err.message);
      alert("Delete Error: " + err.message);
    }
  };

  if (!customer) return null;

  const aadhaarStr = customer.AadhaarNo ? String(customer.AadhaarNo) : '';
  const maskedAadhaar = aadhaarStr 
    ? aadhaarStr.replace(/.(?=.{4})/g, 'x').replace(/(.{4})/g, '$1 ').trim()
    : 'N/A';
  const unmaskedAadhaar = aadhaarStr 
    ? aadhaarStr.replace(/(.{4})/g, '$1 ').trim() 
    : 'N/A';

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {isEditing ? 'Edit Customer Details' : 'Customer Details'}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {!isEditing && (
                <>
                  <button className="btn-icon" onClick={handleEditClick} title="Edit Customer">
                    <Edit2 size={20} />
                  </button>
                  <button className="btn-icon" onClick={() => setShowDeleteConfirm(true)} title="Delete Customer" style={{ color: 'var(--danger)' }}>
                    <Trash2 size={20} />
                  </button>
                </>
              )}
              <button className="modal-close" onClick={onClose}><X size={24} /></button>
            </div>
          </div>
          
          <div className="modal-body">
            {error && <div style={{ color: 'var(--danger)', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
            
            {showDeleteConfirm && (
              <div style={{ padding: '1.5rem', backgroundColor: '#fef2f2', border: '1px solid var(--danger)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '0.5rem' }}>Delete Customer?</h3>
                <p style={{ marginBottom: '1rem' }}>Are you sure you want to permanently delete this customer and all associated documents? This action cannot be undone.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <p className="form-label" style={{ color: 'var(--text-muted)' }}>Name</p>
                {isEditing ? (
                  <input type="text" className="form-input" name="Name" value={formData.Name || ''} onChange={handleChange} />
                ) : (
                  <p style={{ fontWeight: 500, fontSize: '1.1rem' }}>{formData.Name}</p>
                )}
              </div>
              
              <div>
                <p className="form-label" style={{ color: 'var(--text-muted)' }}>Aadhaar Number</p>
                {isEditing ? (
                  <input type="text" className="form-input" name="AadhaarNo" value={formData.AadhaarNo || ''} onChange={handleChange} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '1.1rem' }}>
                      {showAadhaar ? unmaskedAadhaar : maskedAadhaar}
                    </p>
                    <button className="btn-icon" onClick={() => setShowAadhaar(!showAadhaar)}>
                      <Eye size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <p className="form-label" style={{ color: 'var(--text-muted)' }}>Phone Number</p>
                {isEditing ? (
                  <input type="text" className="form-input" name="PhoneNo" value={formData.PhoneNo || ''} onChange={handleChange} />
                ) : (
                  <p style={{ fontWeight: 500 }}>{formData.PhoneNo || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <p className="form-label" style={{ color: 'var(--text-muted)' }}>Village</p>
                {isEditing ? (
                  <input type="text" className="form-input" name="Village" value={formData.Village || ''} onChange={handleChange} />
                ) : (
                  <p style={{ fontWeight: 500 }}>{formData.Village || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <p className="form-label" style={{ color: 'var(--text-muted)' }}>Date of Birth</p>
                {isEditing ? (
                  <input type="date" className="form-input" name="DateOfBirth" value={formData.DateOfBirth || ''} onChange={handleChange} />
                ) : (
                  <p style={{ fontWeight: 500 }}>{formatDate(formData.DateOfBirth)}</p>
                )}
              </div>
              
              <div>
                <p className="form-label" style={{ color: 'var(--text-muted)' }}>Religion</p>
                {isEditing ? (
                  <input type="text" className="form-input" name="Religion" value={formData.Religion || ''} onChange={handleChange} />
                ) : (
                  <p style={{ fontWeight: 500 }}>{formData.Religion || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <p className="form-label" style={{ color: 'var(--text-muted)' }}>Caste</p>
                {isEditing ? (
                  <input type="text" className="form-input" name="Caste" value={formData.Caste || ''} onChange={handleChange} />
                ) : (
                  <p style={{ fontWeight: 500 }}>{formData.Caste || 'N/A'}</p>
                )}
              </div>
              
              {!isEditing && (
                <div>
                  <p className="form-label" style={{ color: 'var(--text-muted)' }}>Created Date</p>
                  <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{formatDate(customer.CreatedAt)}</p>
                </div>
              )}
            </div>
            
            {!isEditing && (
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <a 
                  href={customer.PhoneNo ? `https://wa.me/91${customer.PhoneNo}` : '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ flex: 1, opacity: !customer.PhoneNo ? 0.5 : 1, pointerEvents: !customer.PhoneNo ? 'none' : 'auto' }}
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
                <a 
                  href={customer.PhoneNo ? `tel:${customer.PhoneNo}` : '#'} 
                  className="btn btn-secondary"
                  style={{ flex: 1, opacity: !customer.PhoneNo ? 0.5 : 1, pointerEvents: !customer.PhoneNo ? 'none' : 'auto' }}
                >
                  <Phone size={18} /> Call
                </a>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Customer Documents</h3>
                
                {documents && documents.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', gap: '0.35rem' }} 
                      onClick={handleDownloadAllDocuments}
                      title="Download all documents for this customer"
                    >
                      <Download size={14} /> Download All ({documents.length})
                    </button>

                    <button 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} 
                      onClick={handleViewDocuments}
                      disabled={loadingDocs}
                    >
                      Refresh
                    </button>
                  </div>
                )}
              </div>
              
              {loadingDocs && <Loader text="Fetching documents..." />}
              
              {!loadingDocs && documents && documents.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>No documents uploaded for this customer.</p>
              )}
              
              {!loadingDocs && documents && documents.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {documents.map((doc, idx) => {
                    const fileName = doc.FileName || doc.name || 'Document';
                    const mime = doc.MimeType || doc.mimeType || '';
                    const ext = fileName.split('.').pop().toLowerCase();
                    const isImg = mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);

                    return (
                      <div key={idx} className="document-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                          <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', color: 'var(--primary-color)', flexShrink: 0 }}>
                            {isImg ? <ImageIcon size={22} /> : <FileText size={22} />}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {fileName}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                              {ext} File
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap' }}>
                          <button 
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                            onClick={() => setPreviewDoc(doc)}
                            title="Preview Document in App"
                          >
                            <Eye size={15} /> Preview
                          </button>

                          <button 
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                            onClick={() => handleDownloadSingleDoc(doc)}
                            title="Download file"
                          >
                            <Download size={15} /> Download
                          </button>
                          
                          {doc.DriveURL && (
                            <a 
                              href={doc.DriveURL} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                              title="Open in Google Drive"
                            >
                              <ExternalLink size={15} /> Drive
                            </a>
                          )}
                          
                          {isEditing && (
                            <button 
                              type="button"
                              className="btn btn-danger"
                              style={{ padding: '0.4rem 0.6rem' }}
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteDocument(doc.DocumentID || doc.documentId);
                              }}
                              title="Delete Document"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {isEditing && (
                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Upload New Documents</h4>
                  <DocumentUploader 
                    documents={newDocuments} 
                    setDocuments={setNewDocuments} 
                  />
                </div>
              )}
            </div>
            
            {isEditing && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader text="Saving..." /> : <><Save size={18} /> Save Changes</>}
                </button>
                <button className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  Cancel
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {previewDoc && (
        <DocumentPreviewModal 
          doc={previewDoc} 
          onClose={() => setPreviewDoc(null)} 
        />
      )}
    </>
  );
}

