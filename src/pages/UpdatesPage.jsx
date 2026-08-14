import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { api } from '../services/api';
import { 
  Clock, 
  CheckCircle2, 
  Search, 
  PlusCircle, 
  UserCheck, 
  UserPlus, 
  Phone, 
  MessageCircle,
  MapPin, 
  Calendar, 
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function UpdatesPage() {
  const [customers, setCustomers] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    AadhaarNo: '',
    Name: '',
    PhoneNo: '',
    Village: '',
    Description: '',
    Status: 'Pending'
  });

  const [isExistingCustomer, setIsExistingCustomer] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [custRes, updRes] = await Promise.all([
        api.getCustomers(),
        api.getUpdates()
      ]);

      if (custRes.success) setCustomers(custRes.data);
      if (updRes.success) setUpdates(updRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const getUpdId = (upd) => upd ? (upd.UpdateID || upd.updateId || upd.ID || upd.id) : '';

  const handleAadhaarChange = (val) => {
    const numbersOnly = val.replace(/\D/g, '');
    if (numbersOnly.length <= 12) {
      setFormData(prev => ({ ...prev, AadhaarNo: numbersOnly }));

      // Auto-lookup if 12 digits entered
      if (numbersOnly.length === 12) {
        const found = customers.find(c => String(c.AadhaarNo).trim() === numbersOnly);
        if (found) {
          setIsExistingCustomer(true);
          setFormData(prev => ({
            ...prev,
            AadhaarNo: numbersOnly,
            Name: found.Name || '',
            PhoneNo: found.PhoneNo || '',
            Village: found.Village || ''
          }));
        } else {
          setIsExistingCustomer(false);
        }
      } else {
        setIsExistingCustomer(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.AadhaarNo || formData.AadhaarNo.length !== 12) {
      setError('Aadhaar Number is mandatory and must be 12 digits.');
      return;
    }

    if (!formData.Description) {
      setError('Description is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.addUpdate(formData);
      if (res.success) {
        setSuccess(`Application update added successfully! (ID: ${res.updateId || res.data?.UpdateID})`);
        
        // Reset Form
        setFormData({
          AadhaarNo: '',
          Name: '',
          PhoneNo: '',
          Village: '',
          Description: '',
          Status: 'Pending'
        });
        setIsExistingCustomer(false);

        // Refresh list
        fetchInitialData();
      } else {
        setError(res.error || 'Failed to save application update.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (upd, currentStatus) => {
    const updateId = typeof upd === 'object' ? getUpdId(upd) : upd;
    const newStatus = currentStatus === 'Pending' ? 'Success' : 'Pending';

    try {
      setUpdates(prev => prev.map(u => 
        String(getUpdId(u)) === String(updateId) ? { ...u, Status: newStatus, UpdatedAt: new Date().toISOString() } : u
      ));

      const res = await api.updateUpdateStatus(updateId, newStatus);
      if (!res.success) {
        fetchInitialData();
        alert("Failed to update status: " + (res.error || 'Unknown error'));
      }
    } catch (err) {
      fetchInitialData();
      alert("Status update error: " + err.message);
    }
  };

  const handleDeleteUpdate = async (upd) => {
    const updateId = typeof upd === 'object' ? getUpdId(upd) : upd;

    if (!updateId) {
      alert("Error: Cannot find valid Update ID for this record.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete update record (${updateId})?`)) return;

    // Optimistically remove from state
    setUpdates(prev => prev.filter(u => String(getUpdId(u)) !== String(updateId)));

    try {
      const res = await api.deleteUpdate(updateId);
      if (res && res.success) {
        setSuccess(`Update record ${updateId} deleted successfully.`);
      } else {
        alert("Delete failed on server: " + (res.error || 'Unknown error'));
        fetchInitialData();
      }
    } catch (err) {
      alert("Delete network error: " + err.message);
      fetchInitialData();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return 'N/A';
    const str = String(aadhaar);
    return str.replace(/.(?=.{4})/g, 'x').replace(/(.{4})/g, '$1 ').trim();
  };

  // Filter updates by search term
  const filteredUpdates = updates.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.Name && String(u.Name).toLowerCase().includes(term)) ||
      (u.AadhaarNo && String(u.AadhaarNo).includes(term)) ||
      (u.Description && String(u.Description).toLowerCase().includes(term)) ||
      (u.Village && String(u.Village).toLowerCase().includes(term))
    );
  });

  // Sort helper: Date descending (today first)
  const sortByDateDesc = (arr) => {
    return [...arr].sort((a, b) => {
      const timeA = new Date(a.CreatedAt || a.UpdatedAt || 0).getTime();
      const timeB = new Date(b.CreatedAt || b.UpdatedAt || 0).getTime();
      return timeB - timeA;
    });
  };

  // Split into Pending (TOP) and Success (BOTTOM)
  const pendingUpdates = sortByDateDesc(filteredUpdates.filter(u => u.Status !== 'Success'));
  const successUpdates = sortByDateDesc(filteredUpdates.filter(u => u.Status === 'Success'));

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock color="var(--primary-color)" /> Application Updates Track
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Add and track customer application updates, pending status, and completed logs.
            </p>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={fetchInitialData}
            disabled={loading}
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Add Update Form Card */}
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} color="var(--primary-color)" /> Add New Application Update
          </h2>

          {success && (
            <div style={{ backgroundColor: '#ecfdf5', color: 'var(--success)', border: '1px solid var(--success)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              {success}
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              
              {/* Aadhaar No Input with Auto-Fill */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Aadhaar Number <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="12-digit Aadhaar No"
                  value={formData.AadhaarNo}
                  onChange={e => handleAadhaarChange(e.target.value)}
                  required
                />
                {isExistingCustomer ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontWeight: 500 }}>
                    <UserCheck size={14} /> Existing customer found (auto-filled)
                  </span>
                ) : formData.AadhaarNo.length === 12 ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontWeight: 500 }}>
                    <UserPlus size={14} /> New Aadhaar Number
                  </span>
                ) : null}
              </div>

              {/* Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Customer Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="Name"
                  placeholder="Customer Name"
                  value={formData.Name}
                  onChange={handleChange}
                  readOnly={isExistingCustomer}
                  style={{ backgroundColor: isExistingCustomer ? '#f3f4f6' : 'white' }}
                />
              </div>

              {/* Phone */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="PhoneNo"
                  placeholder="Phone Number"
                  value={formData.PhoneNo}
                  onChange={handleChange}
                  readOnly={isExistingCustomer}
                  style={{ backgroundColor: isExistingCustomer ? '#f3f4f6' : 'white' }}
                />
              </div>

              {/* Village */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Village / Town</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="Village"
                  placeholder="Village"
                  value={formData.Village}
                  onChange={handleChange}
                  readOnly={isExistingCustomer}
                  style={{ backgroundColor: isExistingCustomer ? '#f3f4f6' : 'white' }}
                />
              </div>

            </div>

            {/* Description & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Update Description <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea 
                  rows={3}
                  className="form-input"
                  name="Description"
                  placeholder="Enter update description, status details, notes..."
                  value={formData.Description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status Type</label>
                <select 
                  className="form-select"
                  name="Status"
                  value={formData.Status}
                  onChange={handleChange}
                  style={{ height: '45px' }}
                >
                  <option value="Pending">Pending ⏳</option>
                  <option value="Success">Success ✓</option>
                </select>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ minWidth: '160px' }}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Update'}
              </button>
            </div>
          </form>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search updates by Customer Name, Aadhaar No, Description, or Village..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Loader text="Loading application updates..." />
        ) : (
          <>
            {/* SECTION 1: PENDING UPDATES (TOP) */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} /> Pending Updates ({pendingUpdates.length})
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest updates first</span>
              </div>

              {pendingUpdates.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', backgroundColor: '#fffbebfb', border: '1px dashed #fcd34d' }}>
                  <p>No pending updates found.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingUpdates.map(upd => (
                    <div 
                      key={getUpdId(upd) || Math.random()} 
                      className="card"
                      style={{ 
                        borderLeft: '4px solid #f59e0b', 
                        padding: '1.25rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <h3 style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>{upd.Name || 'Unknown Customer'}</h3>
                            <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                              Pending ⏳
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span>Aadhaar: <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{maskAadhaar(upd.AadhaarNo)}</strong></span>
                            {upd.PhoneNo && <span><Phone size={13} style={{ display: 'inline' }} /> {upd.PhoneNo}</span>}
                            {upd.Village && <span><MapPin size={13} style={{ display: 'inline' }} /> {upd.Village}</span>}
                            <span><Calendar size={13} style={{ display: 'inline' }} /> {formatDate(upd.CreatedAt)}</span>
                          </div>
                        </div>

                        <div className="update-card-actions">
                          {upd.PhoneNo && (
                            <>
                              <a 
                                href={`https://wa.me/91${upd.PhoneNo}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-whatsapp"
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                              >
                                <MessageCircle size={14} /> WhatsApp
                              </a>
                              <a 
                                href={`tel:${upd.PhoneNo}`} 
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                              >
                                <Phone size={14} /> Call
                              </a>
                            </>
                          )}

                          <button 
                            className="btn"
                            style={{ backgroundColor: '#10b981', color: 'white', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => handleStatusToggle(upd, 'Pending')}
                            title="Mark as Success"
                          >
                            <CheckCircle2 size={15} /> Mark as Success
                          </button>

                          <button 
                            className="btn"
                            style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => handleDeleteUpdate(upd)}
                            title="Delete Update Record"
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#fffbe6', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #ffe58f', fontSize: '0.9rem', color: '#434343' }}>
                        <strong>Description:</strong> {upd.Description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: SUCCESS UPDATES (BOTTOM) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} /> Success Updates ({successUpdates.length})
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed records</span>
              </div>

              {successUpdates.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', backgroundColor: '#ecfdf5', border: '1px dashed #6ee7b7' }}>
                  <p>No completed success updates found.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {successUpdates.map(upd => (
                    <div 
                      key={getUpdId(upd) || Math.random()} 
                      className="card"
                      style={{ 
                        borderLeft: '4px solid #10b981', 
                        padding: '1.25rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <h3 style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>{upd.Name || 'Unknown Customer'}</h3>
                            <span style={{ backgroundColor: '#d1fae5', color: '#065f46', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                              Success ✓
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span>Aadhaar: <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{maskAadhaar(upd.AadhaarNo)}</strong></span>
                            {upd.PhoneNo && <span><Phone size={13} style={{ display: 'inline' }} /> {upd.PhoneNo}</span>}
                            {upd.Village && <span><MapPin size={13} style={{ display: 'inline' }} /> {upd.Village}</span>}
                            <span><Calendar size={13} style={{ display: 'inline' }} /> {formatDate(upd.CreatedAt)}</span>
                          </div>
                        </div>

                        <div className="update-card-actions">
                          {upd.PhoneNo && (
                            <>
                              <a 
                                href={`https://wa.me/91${upd.PhoneNo}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-whatsapp"
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                              >
                                <MessageCircle size={14} /> WhatsApp
                              </a>
                              <a 
                                href={`tel:${upd.PhoneNo}`} 
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                              >
                                <Phone size={14} /> Call
                              </a>
                            </>
                          )}

                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => handleStatusToggle(upd, 'Success')}
                            title="Revert to Pending"
                          >
                            <Clock size={15} /> Revert to Pending
                          </button>

                          <button 
                            className="btn"
                            style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => handleDeleteUpdate(upd)}
                            title="Delete Update Record"
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0', fontSize: '0.9rem', color: '#166534' }}>
                        <strong>Description:</strong> {upd.Description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
