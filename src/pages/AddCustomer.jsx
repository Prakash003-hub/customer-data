import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import DocumentUploader from '../components/DocumentUploader';
import CustomerDetails from '../components/CustomerDetails';
import Loader from '../components/Loader';
import { Save, AlertTriangle, Eye, ArrowRight } from 'lucide-react';

export default function AddCustomer() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    Name: '',
    AadhaarNo: '',
    PhoneNo: '',
    Village: '',
    DateOfBirth: '',
    Religion: '',
    Caste: ''
  });
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Duplicate Aadhaar check state
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [viewingCustomerModal, setViewingCustomerModal] = useState(null);

  // Live duplicate Aadhaar check when 12 digits are entered
  useEffect(() => {
    const checkDuplicateAadhaar = async () => {
      if (formData.AadhaarNo && formData.AadhaarNo.length === 12) {
        try {
          const res = await api.getCustomers();
          if (res.success && Array.isArray(res.data)) {
            const match = res.data.find(c => String(c.AadhaarNo).trim() === String(formData.AadhaarNo).trim());
            if (match) {
              setExistingCustomer(match);
              setError(`Aadhaar Number ${formData.AadhaarNo} is already registered to "${match.Name}". Duplicate entries are not allowed.`);
              return;
            }
          }
        } catch (e) {
          // ignore
        }
      }
      setExistingCustomer(null);
    };

    checkDuplicateAadhaar();
  }, [formData.AadhaarNo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Aadhaar number validation (numbers only, max 12)
    if (name === 'AadhaarNo') {
      const numbersOnly = value.replace(/\D/g, '');
      if (numbersOnly.length <= 12) {
        setFormData({ ...formData, [name]: numbersOnly });
      }
    } 
    // Phone number validation (numbers only, max 10)
    else if (name === 'PhoneNo') {
      const numbersOnly = value.replace(/\D/g, '');
      if (numbersOnly.length <= 10) {
        setFormData({ ...formData, [name]: numbersOnly });
      }
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleOpenExistingCustomer = (cust) => {
    const customerToOpen = cust || existingCustomer;
    if (customerToOpen) {
      navigate('/dashboard', { state: { selectedCustomer: customerToOpen, searchAadhaar: formData.AadhaarNo } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.AadhaarNo || formData.AadhaarNo.length !== 12) {
      setError('Aadhaar Number is mandatory and must be exactly 12 digits.');
      return;
    }

    // If existing customer already detected, directly redirect to customer details
    if (existingCustomer) {
      handleOpenExistingCustomer(existingCustomer);
      return;
    }

    setLoading(true);
    setStatusText('Saving customer data...');
    
    try {
      // Step 1: Save Customer Data
      const customerResult = await api.addCustomer(formData);
      
      if (!customerResult.success) {
        // If Aadhaar already exists on backend
        if (customerResult.alreadyExists || (customerResult.error && customerResult.error.toLowerCase().includes('already exists'))) {
          const cust = customerResult.customer || {
            Name: formData.Name || 'Existing Customer',
            AadhaarNo: formData.AadhaarNo,
            PhoneNo: formData.PhoneNo,
            Village: formData.Village,
            CustomerID: customerResult.customerId
          };
          setExistingCustomer(cust);
          setError(`Aadhaar Number ${formData.AadhaarNo} already exists in database for "${cust.Name}". Redirecting to customer details...`);
          
          setTimeout(() => {
            handleOpenExistingCustomer(cust);
          }, 1500);
          return;
        }
        throw new Error(customerResult.error || 'Failed to save customer data.');
      }
      
      const customerId = customerResult.customerId;
      
      // Step 2: Upload Documents (if any)
      if (documents.length > 0) {
        setStatusText(`Customer saved. Uploading ${documents.length} document(s)...`);
        
        const uploadResult = await api.uploadDocuments(
          customerId, 
          documents,
          formData.Name
        );
        
        if (!uploadResult.success) {
          setSuccess(`Customer data saved (ID: ${customerId}), but document upload failed: ${uploadResult.error}`);
          setLoading(false);
          return;
        }
      }
      
      // Success!
      setSuccess('Customer data saved successfully.');
      
      // Clear form
      setFormData({
        Name: '', AadhaarNo: '', PhoneNo: '', Village: '', DateOfBirth: '', Religion: '', Caste: ''
      });
      setDocuments([]);
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      
      <main className="main-content" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Add New Customer</h1>
        
        {/* Existing Customer Warning Alert Box */}
        {existingCustomer && (
          <div className="card" style={{ backgroundColor: '#fffbebfd', borderColor: '#f59e0b', border: '1px solid', marginBottom: '1.5rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={24} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#b45309', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                  Aadhaar Already Registered!
                </h3>
                <p style={{ color: '#92400e', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.45 }}>
                  A customer with Aadhaar Number <strong>{formData.AadhaarNo}</strong> is already registered under the name <strong>"{existingCustomer.Name}"</strong> {existingCustomer.Village ? `(Village: ${existingCustomer.Village})` : ''}. Duplicate customer entries are not allowed.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => handleOpenExistingCustomer(existingCustomer)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}
                  >
                    <Eye size={16} /> View Customer Details <ArrowRight size={14} />
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setViewingCustomerModal(existingCustomer)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    Quick Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="card" style={{ backgroundColor: '#ecfdf5', borderColor: 'var(--success)', border: '1px solid', marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--success)', fontWeight: 500 }}>{success}</p>
          </div>
        )}
        
        {error && !existingCustomer && (
          <div className="card" style={{ backgroundColor: '#fef2f2', borderColor: 'var(--danger)', border: '1px solid', marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--danger)', fontWeight: 500 }}>{error}</p>
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Aadhaar Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input 
                  type="text" 
                  name="AadhaarNo"
                  className="form-input" 
                  placeholder="12-digit Aadhaar Number"
                  value={formData.AadhaarNo}
                  onChange={handleChange}
                  style={{ borderColor: existingCustomer ? '#f59e0b' : undefined }}
                  required
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="Name"
                  className="form-input" 
                  placeholder="Customer Name"
                  value={formData.Name}
                  onChange={handleChange}
                  disabled={!!existingCustomer}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  name="PhoneNo"
                  className="form-input" 
                  placeholder="10-digit Mobile Number"
                  value={formData.PhoneNo}
                  onChange={handleChange}
                  disabled={!!existingCustomer}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date of Birth</label>
                <input 
                  type="date" 
                  name="DateOfBirth"
                  className="form-input" 
                  value={formData.DateOfBirth}
                  onChange={handleChange}
                  disabled={!!existingCustomer}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Village / Town</label>
                <input 
                  type="text" 
                  name="Village"
                  className="form-input" 
                  placeholder="Village or Town"
                  value={formData.Village}
                  onChange={handleChange}
                  disabled={!!existingCustomer}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Religion</label>
                <input 
                  type="text" 
                  name="Religion"
                  className="form-input" 
                  placeholder="Religion"
                  value={formData.Religion}
                  onChange={handleChange}
                  disabled={!!existingCustomer}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Caste</label>
                <input 
                  type="text" 
                  name="Caste"
                  className="form-input" 
                  placeholder="Caste"
                  value={formData.Caste}
                  onChange={handleChange}
                  disabled={!!existingCustomer}
                />
              </div>
              
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Upload Documents</h3>
            
            <DocumentUploader 
              documents={documents} 
              setDocuments={setDocuments} 
            />

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {existingCustomer ? (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => handleOpenExistingCustomer(existingCustomer)}
                  style={{ minWidth: '180px', fontWeight: 600 }}
                >
                  <Eye size={18} /> View Existing Customer
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ minWidth: '150px' }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : <><Save size={18} /> Save Customer</>}
                </button>
              )}
            </div>
            
          </form>
          
          {loading && (
            <div style={{ marginTop: '2rem' }}>
              <Loader text={statusText} />
            </div>
          )}
        </div>
      </main>

      {/* Quick Customer Details Modal */}
      {viewingCustomerModal && (
        <CustomerDetails 
          customer={viewingCustomerModal}
          onClose={() => setViewingCustomerModal(null)}
          onRefresh={() => {}}
        />
      )}
    </div>
  );
}
