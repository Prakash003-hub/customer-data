import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import DocumentUploader from '../components/DocumentUploader';
import Loader from '../components/Loader';
import { Save } from 'lucide-react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.AadhaarNo || formData.AadhaarNo.length !== 12) {
      setError('Aadhaar Number is mandatory and must be exactly 12 digits.');
      return;
    }

    setLoading(true);
    setStatusText('Saving customer data...');
    
    try {
      // Step 1: Save Customer Data
      const customerResult = await api.addCustomer(formData);
      
      if (!customerResult.success) {
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
          // Note: The customer was created, but documents failed.
          // We show a partial success message.
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
      
      // Optional: redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
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
        
        {success && (
          <div className="card" style={{ backgroundColor: '#ecfdf5', borderColor: 'var(--success)', border: '1px solid', marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--success)', fontWeight: 500 }}>{success}</p>
          </div>
        )}
        
        {error && (
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

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ minWidth: '150px' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : <><Save size={18} /> Save Customer</>}
              </button>
            </div>
            
          </form>
          
          {loading && (
            <div style={{ marginTop: '2rem' }}>
              <Loader text={statusText} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
