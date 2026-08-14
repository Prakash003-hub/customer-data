import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ManageCategoriesModal({ categories, onClose, onRefresh, showToast }) {
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.addCategory(newCatName.trim());
      if (res.success) {
        setNewCatName('');
        if (showToast) showToast(`Category "${newCatName.trim()}" created!`);
        if (onRefresh) onRefresh();
      } else {
        setError(res.error || 'Failed to create category');
      }
    } catch (err) {
      setError(err.message || 'Error creating category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;

    try {
      const res = await api.deleteCategory(catName);
      if (res.success) {
        if (showToast) showToast(`Category "${catName}" removed.`);
        if (onRefresh) onRefresh();
      } else {
        alert(res.error || 'Failed to delete category');
      }
    } catch (err) {
      alert(err.message || 'Error deleting category');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={20} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Manage Categories (Admin)</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="New category name..."
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !newCatName.trim()}
              style={{ flexShrink: 0, padding: '0.6rem 1rem' }}
            >
              <Plus size={16} /> Add
            </button>
          </form>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.85rem', backgroundColor: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: '0.35rem' }}>
              {error}
            </div>
          )}

          {/* List of Active Categories */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', uppercase: true, marginBottom: '0.5rem' }}>
              ACTIVE CATEGORIES ({categories.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {categories.map(cat => (
                <div 
                  key={cat} 
                  style={{ 
                    display: 'flex', 
                    justify: 'space-between', 
                    alignItems: 'center', 
                    padding: '0.55rem 0.85rem', 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '0.4rem' 
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={14} color="var(--primary-color)" />
                    {cat}
                  </span>

                  <button 
                    type="button" 
                    onClick={() => handleDeleteCategory(cat)}
                    className="btn-icon" 
                    title={`Remove ${cat}`}
                    style={{ color: 'var(--danger)', padding: '0.2rem' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
