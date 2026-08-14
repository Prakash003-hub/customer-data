import React, { useState, useRef } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';

export default function DocumentUploader({ documents, setDocuments }) {
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const processFiles = (files) => {
    setError('');
    if (files.length === 0) return;
    
    // Process all selected files
    const newDocsPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        // Check if file is already added by name
        if (documents.some(doc => doc.name === file.name)) {
          resolve(null); // Skip duplicates silently or handle them
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64String = reader.result.split(',')[1];
          resolve({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: "Document", // Generic type for backend
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB',
            mimeType: file.type,
            base64: base64String
          });
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
      });
    });

    Promise.all(newDocsPromises).then(results => {
      const validDocs = results.filter(doc => doc !== null);
      if (validDocs.length < files.length) {
         // Some files were skipped (duplicates)
         setError("Some files were skipped as they were already added.");
      }
      if (validDocs.length > 0) {
        setDocuments(prev => [...prev, ...validDocs]);
      }
    }).catch(() => {
      setError("Failed to read one or more files!");
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    e.target.value = ''; // Reset input
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      // Filter out non-supported files if necessary (PDF, JPG, JPEG, PNG)
      const supportedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      const validFiles = files.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return supportedExtensions.includes(ext) || file.type.startsWith('image/');
      });
      
      if (validFiles.length < files.length) {
        setError("Some files were rejected because they are not supported formats.");
      }
      
      processFiles(validFiles);
    }
  };

  const removeDocument = (idToRemove) => {
    setDocuments(documents.filter(doc => doc.id !== idToRemove));
  };

  return (
    <div>
      <div 
        className={`upload-container ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
          <label 
            className="btn btn-primary" 
            style={{ cursor: 'pointer', display: 'inline-flex', justifyContent: 'center', minWidth: '200px' }}
          >
            <Upload size={18} style={{ marginRight: '0.5rem' }} />
            Choose Files
            <input 
              ref={inputRef}
              type="file" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
            />
          </label>
        </div>
        
        {error && (
          <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          Drag and drop your files here, or click to select files.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Supported formats: PDF, JPG, JPEG, PNG
        </p>
      </div>

      {documents.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Selected Documents ({documents.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {documents.map(doc => (
              <div key={doc.id} className="document-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <File size={20} color="var(--primary-color)" />
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{doc.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {doc.size}
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  className="btn-icon" 
                  onClick={() => removeDocument(doc.id)}
                  style={{ color: 'var(--danger)' }}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
