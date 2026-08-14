import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import CustomerFilters from '../components/CustomerFilters';
import CustomerDetails from '../components/CustomerDetails';
import { Phone, MessageCircle, Eye, CreditCard, MapPin } from 'lucide-react';

export default function Dashboard() {
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    Name: '',
    AadhaarNo: '',
    PhoneNo: '',
    Village: '',
    DateOfBirth: '',
    Religion: '',
    Caste: ''
  });
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    if (location.state?.selectedCustomer) {
      setSelectedCustomer(location.state.selectedCustomer);
    }
    if (location.state?.searchAadhaar) {
      setFilters(prev => ({ ...prev, AadhaarNo: location.state.searchAadhaar }));
    }
  }, [location.state]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getCustomers();
      if (result.success) {
        setCustomers(result.data);
        setFilteredCustomers(result.data);
        // If redirected with an Aadhaar number, find matching customer
        if (location.state?.searchAadhaar && !location.state?.selectedCustomer) {
          const match = result.data.find(c => String(c.AadhaarNo).trim() === String(location.state.searchAadhaar).trim());
          if (match) setSelectedCustomer(match);
        }
      } else {
        setError(result.error || 'Failed to fetch customers');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);


  const applyFilters = React.useCallback(() => {
    let result = customers;
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        const searchTerm = filters[key].toLowerCase();
        result = result.filter(c => 
          c[key] && String(c[key]).toLowerCase().includes(searchTerm)
        );
      }
    });
    
    setFilteredCustomers(result);
  }, [customers, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleClearFilters = () => {
    setFilters({
      Name: '', AadhaarNo: '', PhoneNo: '', Village: '', DateOfBirth: '', Religion: '', Caste: ''
    });
  };

  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return 'N/A';
    const str = String(aadhaar);
    return str.replace(/.(?=.{4})/g, 'x').replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className="app-container">
      <Navbar />
      
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Customer Dashboard</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Customer' : 'Customers'} Found
          </div>
        </div>

        <CustomerFilters 
          filters={filters} 
          setFilters={setFilters} 
          onClear={handleClearFilters} 
        />

        {loading ? (
          <Loader text="Loading customer data..." />
        ) : error ? (
          <div className="card" style={{ color: 'var(--danger)', textAlign: 'center', padding: '3rem' }}>
            <p>{error}</p>
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={fetchCustomers}>
              Retry
            </button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>No customers found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-container hidden-mobile">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Aadhaar No</th>
                    <th>Phone / Village</th>
                    <th>WhatsApp</th>
                    <th>Call</th>
                    <th style={{ textAlign: 'center' }}>Details / Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => (
                    <tr 
                      key={customer.CustomerID} 
                      style={{ cursor: 'pointer', transition: 'background-color 0.15s' }}
                      onClick={() => setSelectedCustomer(customer)}
                      className="table-row-hover"
                    >
                      <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{customer.Name}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {maskAadhaar(customer.AadhaarNo)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{customer.PhoneNo || 'N/A'}</div>
                        {customer.Village && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{customer.Village}</div>}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <a 
                          href={customer.PhoneNo ? `https://wa.me/91${customer.PhoneNo}` : '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-whatsapp"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', opacity: !customer.PhoneNo ? 0.5 : 1, pointerEvents: !customer.PhoneNo ? 'none' : 'auto' }}
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <a 
                          href={customer.PhoneNo ? `tel:${customer.PhoneNo}` : '#'} 
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', opacity: !customer.PhoneNo ? 0.5 : 1, pointerEvents: !customer.PhoneNo ? 'none' : 'auto' }}
                        >
                          <Phone size={14} /> Call
                        </a>
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Eye size={15} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="hidden-desktop">
              {filteredCustomers.map(customer => (
                <div 
                  key={customer.CustomerID} 
                  className="mobile-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--primary-color)' }}>{customer.Name}</h3>
                      {customer.Village && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={13} /> {customer.Village}
                        </p>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', backgroundColor: 'var(--bg-color)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', color: 'var(--text-muted)' }}>
                      <CreditCard size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {maskAadhaar(customer.AadhaarNo)}
                    </span>
                  </div>

                  <div className="mobile-card-actions" onClick={e => e.stopPropagation()}>
                    <a 
                      href={customer.PhoneNo ? `https://wa.me/91${customer.PhoneNo}` : '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                      style={{ opacity: !customer.PhoneNo ? 0.5 : 1, pointerEvents: !customer.PhoneNo ? 'none' : 'auto' }}
                    >
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                    <a 
                      href={customer.PhoneNo ? `tel:${customer.PhoneNo}` : '#'} 
                      className="btn btn-secondary"
                      style={{ opacity: !customer.PhoneNo ? 0.5 : 1, pointerEvents: !customer.PhoneNo ? 'none' : 'auto' }}
                    >
                      <Phone size={16} /> Call
                    </a>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <Eye size={16} /> Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {selectedCustomer && (
        <CustomerDetails 
          customer={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)} 
          onRefresh={fetchCustomers}
        />
      )}
    </div>
  );
}
