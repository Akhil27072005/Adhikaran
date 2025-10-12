import React, { useState } from 'react';
import axios from 'axios';

const EvidenceUploadModal = ({ isOpen, onClose, caseId, caseTitle, onSuccess }) => {
  const [fileDescription, setFileDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (file) => {
    if (file && file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !fileDescription.trim()) {
      setError('Please select a file and provide a description');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', fileDescription);
      formData.append('case', caseId);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/cases/${caseId}/evidence`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Evidence uploaded successfully:', response.data);
      
      // Reset form
      setSelectedFile(null);
      setFileDescription('');
      
      // Notify parent component
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Close modal
      onClose();
      
    } catch (err) {
      console.error('Evidence upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFileDescription('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show dashboard-upload-modal" style={{ display: 'block' }} role="dialog" aria-modal="true" aria-labelledby="uploadEvidenceLabel">
      <div className="modal-dialog modal-dialog-centered dashboard-upload-modal__dialog" role="document">
        <div className="modal-content dashboard-upload-modal__content">
          <div className="modal-header dashboard-upload-modal__header">
            <h5 className="modal-title" id="uploadEvidenceLabel">Upload Evidence for {caseTitle}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body dashboard-upload-modal__body">
              {/* Drag & drop zone */}
              <input id="evidence-upload-file-hidden" type="file" className="d-none" accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.txt" onChange={handleFileInputChange} />
              <div 
                className={`dashboard-upload-dropzone ${dragActive ? 'dashboard-upload-dropzone--active' : ''}`} 
                onDragOver={handleDrag} 
                onDragLeave={handleDrag} 
                onDrop={handleDrop}
                onClick={() => document.getElementById('evidence-upload-file-hidden').click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && document.getElementById('evidence-upload-file-hidden').click()}
                aria-label="Drag file here or click to browse"
              >
                <img className="dashboard-upload-dropzone__icon-img" src="/assets/download-icon.png" alt="" />
                <div className="dashboard-upload-dropzone__title">Drag file here</div>
                <div className="dashboard-upload-dropzone__subtitle">Or click to browse (10MB max)</div>
                {selectedFile && (
                  <div className="dashboard-upload-dropzone__file text-muted mt-2">Selected: {selectedFile.name}</div>
                )}
              </div>

              <div className="mb-3 mt-3">
                <label className="form-label">File Description</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter file description" 
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="form-text text-danger">
                  {error}
                </div>
              )}

              <div className="form-text">Accepted: PDF, images, or documents</div>
            </div>
            <div className="modal-footer dashboard-upload-modal__footer">
              <button type="button" className="btn--secondary" onClick={handleClose} disabled={uploading}>Cancel</button>
              <button type="submit" className="btn--primary" disabled={uploading || !selectedFile || !fileDescription.trim()}>
                {uploading ? 'Uploading...' : 'Upload Evidence'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default EvidenceUploadModal;
