import React from 'react';
import { X } from 'lucide-react';

export default function CustomerFilters({ filters, setFilters, onClear }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const hasAnyFilter = Object.values(filters).some(v => v !== '');

  return (
    <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Filter Customers</h3>
        <button 
          className="btn btn-secondary" 
          onClick={onClear}
          disabled={!hasAnyFilter}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
        >
          <X size={14} /> Clear All
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        <div>
          <input
            type="text"
            name="Name"
            className="form-input"
            placeholder="Name"
            value={filters.Name}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="AadhaarNo"
            className="form-input"
            placeholder="Aadhaar No"
            value={filters.AadhaarNo}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="PhoneNo"
            className="form-input"
            placeholder="Phone No"
            value={filters.PhoneNo}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="Village"
            className="form-input"
            placeholder="Village"
            value={filters.Village}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="DateOfBirth"
            className="form-input"
            placeholder="Date of Birth"
            value={filters.DateOfBirth}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="Religion"
            className="form-input"
            placeholder="Religion"
            value={filters.Religion}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="Caste"
            className="form-input"
            placeholder="Caste"
            value={filters.Caste}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
