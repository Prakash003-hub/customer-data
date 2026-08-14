import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import WebsiteDetailsModal from '../components/WebsiteDetailsModal';
import ManageCategoriesModal from '../components/ManageCategoriesModal';
import { api } from '../services/api';
import { 
  Globe, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle,
  Tag
} from 'lucide-react';

const SUGGESTED_DOCUMENTS = [
  "Aadhaar Card",
  "PAN Card",
  "Passport Photo",
  "Bank Passbook",
  "Mobile No (OTP)",
  "Electricity Bill",
  "Ration Card",
  "Income Certificate",
  "Caste Certificate",
  "Birth Certificate",
  "10th Marksheet",
  "Driving License"
];

export default function WebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal states
  const [selectedDetailsWebsite, setSelectedDetailsWebsite] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [deletingWebsite, setDeletingWebsite] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Inline New Category creation state inside Add/Edit form
  const [isAddingNewCategoryInline, setIsAddingNewCategoryInline] = useState(false);
  const [inlineCategoryInput, setInlineCategoryInput] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Identity & Governance',
    description: '',
    documentRequirements: [],
    customDocInput: '',
    payFee: '',
    charges: '',
    notes: '',
    urls: [{ label: 'Official Portal', url: '' }]
  });

  const fetchWebsitesAndCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const [webRes, catRes] = await Promise.all([
        api.getWebsites(),
        api.getCategories()
      ]);

      if (webRes.success && Array.isArray(webRes.data)) {
        setWebsites(webRes.data);
      } else {
        setError(webRes.error || 'Failed to load websites');
      }

      if (catRes.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }
    } catch (err) {
      setError(err.message || 'Error fetching website directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsitesAndCategories();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Available categories list for filter tabs (includes 'All')
  const allCategoryTabs = useMemo(() => {
    return ['All', ...categories];
  }, [categories]);

  // Filter websites based on search query and category
  const filteredWebsites = useMemo(() => {
    return websites.filter(site => {
      const matchesCategory = selectedCategory === 'All' || site.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const docText = Array.isArray(site.documentRequirements) 
        ? site.documentRequirements.join(' ') 
        : String(site.documentRequirements || '');
      
      const urlText = Array.isArray(site.urls)
        ? site.urls.map(u => `${u.label} ${u.url}`).join(' ')
        : '';

      const matchesSearch = 
        site.name.toLowerCase().includes(query) ||
        (site.description && site.description.toLowerCase().includes(query)) ||
        (site.category && site.category.toLowerCase().includes(query)) ||
        docText.toLowerCase().includes(query) ||
        urlText.toLowerCase().includes(query) ||
        (site.payFee && site.payFee.toLowerCase().includes(query)) ||
        (site.charges && site.charges.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [websites, searchQuery, selectedCategory]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingWebsite(null);
    setIsAddingNewCategoryInline(false);
    setInlineCategoryInput('');
    setFormData({
      name: '',
      category: categories[0] || 'Identity & Governance',
      description: '',
      documentRequirements: [],
      customDocInput: '',
      payFee: 'Free',
      charges: '₹50 Service Charge',
      notes: '',
      urls: [
        { label: 'Official Portal', url: '' },
        { label: 'Apply Online', url: '' }
      ]
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (site) => {
    setEditingWebsite(site);
    setIsAddingNewCategoryInline(false);
    setInlineCategoryInput('');
    setFormData({
      name: site.name || '',
      category: site.category || categories[0] || 'Identity & Governance',
      description: site.description || '',
      documentRequirements: Array.isArray(site.documentRequirements) ? [...site.documentRequirements] : [],
      customDocInput: '',
      payFee: site.payFee || '',
      charges: site.charges || '',
      notes: site.notes || '',
      urls: Array.isArray(site.urls) && site.urls.length > 0 
        ? site.urls.map(u => ({ ...u }))
        : [{ label: 'Official Portal', url: '' }]
    });
    setIsAddModalOpen(true);
  };

  const handleCreateCategoryInline = async () => {
    const trimmed = inlineCategoryInput.trim();
    if (!trimmed) return;
    const res = await api.addCategory(trimmed);
    if (res.success) {
      showToast(`Created category "${trimmed}"`);
      setCategories(res.data);
      setFormData(prev => ({ ...prev, category: trimmed }));
      setIsAddingNewCategoryInline(false);
      setInlineCategoryInput('');
    } else {
      alert(res.error || 'Failed to create category');
    }
  };

  const handleAddUrlField = () => {
    setFormData(prev => ({
      ...prev,
      urls: [...prev.urls, { label: '', url: '' }]
    }));
  };

  const handleRemoveUrlField = (index) => {
    setFormData(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index)
    }));
  };

  const handleUrlChange = (index, field, value) => {
    setFormData(prev => {
      const newUrls = [...prev.urls];
      newUrls[index][field] = value;
      return { ...prev, urls: newUrls };
    });
  };

  const handleAddDocTag = (doc) => {
    const trimmed = doc.trim();
    if (!trimmed) return;
    if (!formData.documentRequirements.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        documentRequirements: [...prev.documentRequirements, trimmed],
        customDocInput: ''
      }));
    }
  };

  const handleRemoveDocTag = (docToRemove) => {
    setFormData(prev => ({
      ...prev,
      documentRequirements: prev.documentRequirements.filter(d => d !== docToRemove)
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter Website / Portal Name.");
      return;
    }

    // Filter valid URLs
    const validUrls = formData.urls.filter(u => u.url.trim().length > 0).map(u => ({
      label: u.label.trim() || 'Portal Link',
      url: u.url.trim().startsWith('http') ? u.url.trim() : `https://${u.url.trim()}`
    }));

    if (validUrls.length === 0) {
      alert("Please add at least one valid URL link.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description.trim(),
      documentRequirements: formData.documentRequirements,
      payFee: formData.payFee.trim() || 'N/A',
      charges: formData.charges.trim() || 'N/A',
      notes: formData.notes.trim(),
      urls: validUrls
    };

    if (editingWebsite) {
      const res = await api.updateWebsite(editingWebsite.id, payload);
      if (res.success) {
        showToast("Website updated successfully!");
        fetchWebsitesAndCategories();
        setIsAddModalOpen(false);
      } else {
        alert(res.error || "Failed to update website");
      }
    } else {
      const res = await api.addWebsite(payload);
      if (res.success) {
        showToast("New website added to directory!");
        fetchWebsitesAndCategories();
        setIsAddModalOpen(false);
      } else {
        alert(res.error || "Failed to add website");
      }
    }
  };

  const handleDeleteWebsite = async () => {
    if (!deletingWebsite) return;
    const res = await api.deleteWebsite(deletingWebsite.id);
    if (res.success) {
      showToast("Website removed from directory");
      fetchWebsitesAndCategories();
      setDeletingWebsite(null);
    } else {
      alert(res.error || "Failed to delete website");
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Globe size={28} color="var(--primary-color)" />
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)' }}>Websites Directory</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Tap any app icon to view full details, required documents, fees, and direct links.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setIsManageCategoriesOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', fontWeight: 600 }}
              title="Admin Manage Categories"
            >
              <Tag size={16} color="var(--primary-color)" /> Manage Categories
            </button>

            <button 
              className="btn btn-primary" 
              onClick={handleOpenAddModal}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', fontWeight: 600 }}
            >
              <Plus size={18} /> Add Web Portal
            </button>
          </div>
        </div>

        {/* Search & Category Tabs Bar */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="search-box" style={{ flex: '1 1 300px' }}>
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search web portals by name, document, fee, or link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing {filteredWebsites.length} of {websites.length} Apps
            </div>
          </div>

          {/* Dynamic Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.3rem', scrollbarWidth: 'thin' }}>
            {allCategoryTabs.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '2rem',
                  fontSize: '0.8rem',
                  fontWeight: selectedCategory === cat ? 600 : 500,
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--primary-color)' : 'var(--border-color)',
                  backgroundColor: selectedCategory === cat ? 'rgba(79, 70, 229, 0.08)' : 'var(--card-bg)',
                  color: selectedCategory === cat ? 'var(--primary-color)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <Loader text="Loading web apps directory..." />
        ) : error ? (
          <div className="card" style={{ color: 'var(--danger)', textAlign: 'center', padding: '3rem' }}>
            <AlertCircle size={36} style={{ marginBottom: '0.5rem' }} />
            <p>{error}</p>
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={fetchWebsitesAndCategories}>
              Retry
            </button>
          </div>
        ) : filteredWebsites.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <Globe size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No web apps found</h3>
            <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your search query or category filter.' 
                : 'Click the button below to add your first web portal.'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button 
                className="btn btn-secondary" 
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          /* Ultra-clean App Icon Grid View */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '1.25rem' 
          }}>
            {filteredWebsites.map(site => (
              <div 
                key={site.id} 
                className="card website-app-tile"
                onClick={() => setSelectedDetailsWebsite(site)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  padding: '1.35rem 0.85rem',
                  borderRadius: '1rem',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--card-bg)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* App Icon Tile */}
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '1.1rem', 
                  backgroundColor: 'rgba(79, 70, 229, 0.08)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: 'center',
                  color: 'var(--primary-color)',
                  marginBottom: '0.75rem',
                  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.12)'
                }}>
                  <Globe size={32} />
                </div>

                {/* App Name */}
                <h3 style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 700, 
                  color: 'var(--text-main)', 
                  lineHeight: 1.3, 
                  marginBottom: '0.35rem',
                  wordBreak: 'break-word'
                }}>
                  {site.name}
                </h3>

                {/* Category Pill */}
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  color: 'var(--primary-color)',
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '1rem'
                }}>
                  {site.category || 'General'}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Website Full Details Modal View */}
      {selectedDetailsWebsite && (
        <WebsiteDetailsModal 
          website={selectedDetailsWebsite}
          onClose={() => setSelectedDetailsWebsite(null)}
          onEdit={(site) => handleOpenEditModal(site)}
          onDelete={(site) => setDeletingWebsite(site)}
          showToast={showToast}
        />
      )}

      {/* Admin Manage Categories Modal */}
      {isManageCategoriesOpen && (
        <ManageCategoriesModal 
          categories={categories}
          onClose={() => setIsManageCategoriesOpen(false)}
          onRefresh={fetchWebsitesAndCategories}
          showToast={showToast}
        />
      )}

      {/* Add / Edit Website Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                {editingWebsite ? 'Edit Web Portal' : 'Add New Web Portal'}
              </h2>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Web Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Web / Portal Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. UIDAI Aadhaar Portal or Passport Seva"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Dynamic Category Selector with Inline Category Creator */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Category *</label>
                  {!isAddingNewCategoryInline ? (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingNewCategoryInline(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Create New Category
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingNewCategoryInline(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {!isAddingNewCategoryInline ? (
                  <select 
                    className="form-select" 
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Type new category name..."
                      value={inlineCategoryInput}
                      onChange={e => setInlineCategoryInput(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleCreateCategoryInline}
                      style={{ flexShrink: 0, padding: '0.5rem 0.85rem' }}
                    >
                      Save Category
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description / Purpose</label>
                <textarea 
                  className="form-input" 
                  rows={2} 
                  placeholder="Briefly describe what services this web portal provides..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Document Requirements Tags Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Document Requirements</label>
                
                {/* Selected Document Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  {formData.documentRequirements.map((doc, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        backgroundColor: 'rgba(79, 70, 229, 0.1)', 
                        color: 'var(--primary-color)', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {doc}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveDocTag(doc)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', padding: 0 }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Custom Doc Input */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Type a required document and press Add..."
                    value={formData.customDocInput}
                    onChange={e => setFormData({ ...formData, customDocInput: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDocTag(formData.customDocInput);
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => handleAddDocTag(formData.customDocInput)}
                    style={{ flexShrink: 0 }}
                  >
                    Add
                  </button>
                </div>

                {/* Suggested Quick Add Badges */}
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Quick suggestions (click to add):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {SUGGESTED_DOCUMENTS.map(sDoc => (
                      <button
                        key={sDoc}
                        type="button"
                        onClick={() => handleAddDocTag(sDoc)}
                        disabled={formData.documentRequirements.includes(sDoc)}
                        style={{
                          fontSize: '0.725rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '0.25rem',
                          border: '1px solid var(--border-color)',
                          backgroundColor: formData.documentRequirements.includes(sDoc) ? '#e2e8f0' : '#f8fafc',
                          color: formData.documentRequirements.includes(sDoc) ? '#94a3b8' : 'var(--text-main)',
                          cursor: formData.documentRequirements.includes(sDoc) ? 'default' : 'pointer'
                        }}
                      >
                        + {sDoc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pay Fee & Charges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Pay Fee (Govt Fee)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. ₹50 (PVC Card) or Free"
                    value={formData.payFee}
                    onChange={e => setFormData({ ...formData, payFee: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Service Charges</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. ₹100 Service Fee"
                    value={formData.charges}
                    onChange={e => setFormData({ ...formData, charges: e.target.value })}
                  />
                </div>
              </div>

              {/* Multiple URLs & Labels Manager */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Website URLs & Custom Link Labels *</label>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleAddUrlField}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    + Add Link
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {formData.urls.map((urlObj, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Link Label (e.g. Apply Online)"
                        value={urlObj.label}
                        onChange={e => handleUrlChange(idx, 'label', e.target.value)}
                        style={{ width: '35%' }}
                      />
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="https://example.com"
                        value={urlObj.url}
                        onChange={e => handleUrlChange(idx, 'url', e.target.value)}
                        style={{ width: '55%' }}
                      />
                      {formData.urls.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveUrlField(idx)}
                          className="btn-icon" 
                          style={{ color: 'var(--danger)', padding: '0.35rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notes / Instructions (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. OTP mandatory, appointment timing details..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingWebsite ? 'Save Changes' : 'Add Web Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingWebsite && (
        <div className="modal-overlay" onClick={() => setDeletingWebsite(null)}>
          <div className="modal-content" style={{ maxWidth: '420px', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.5rem' }}>
              Delete Web Portal?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Are you sure you want to remove <strong>{deletingWebsite.name}</strong> from your website directory?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setDeletingWebsite(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteWebsite}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
