import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ActionCard from '../components/ActionCard';
import HearingCard from '../components/HearingCard';
import { formatDate } from '../utils/dateUtils';
import '../styles/dashboard.css';

// Actions will be created inside component to access navigate


const UserDashboard = () => {
  // Modal UI state (frontend only — no backend calls)
  const navigate = useNavigate();
  const handleProfile = () => {
    const role = JSON.parse(localStorage.getItem('user') || '{}')?.role;
    if (role === 'judge') navigate('/judge/profile');
    else navigate('/user/profile');
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('accessToken');
      navigate('/', { replace: true });
    }
  };

  const userActions = [
    { label: 'Profile', onClick: handleProfile },
    { label: 'Logout', onClick: handleLogout }
  ];
  // User-involved cases state
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedCaseTitle, setSelectedCaseTitle] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch user-involved cases on mount
  useEffect(() => {
    const fetchCases = async () => {
      setCasesLoading(true);
      setCasesError('');
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/cases/user', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const list = Array.isArray(data?.cases) ? data.cases : [];
        setCases(list);
      } catch (err) {
        setCasesError('Error loading cases. Please try again.');
      } finally {
        setCasesLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleFileNewCase = () => {
    window.location.assign('/add-case');
    console.log('File new case clicked');
  };

  const handleUploadEvidence = () => {
    // Open modal (UI only)
    setShowUploadModal(true);
  };

  const handleFileChange = (event) => {
    // Keep a reference for UI only
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleViewDetails = (hearingId) => {
    // Navigate to case summary page with the case ID
    navigate(`/cases/${hearingId}/summary`);
  };

  const handleEditCase = (caseId) => {
    navigate(`/edit-case/${caseId}`);
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setSelectedCaseId('');
    setSelectedCaseTitle('');
    setFileDescription('');
    setSelectedFile(null);
    setDragActive(false);
  };

  const onCaseIdChange = (e) => {
    const value = e.target.value;
    setSelectedCaseId(value);
    const found = cases.find(c => c.caseId === value);
    setSelectedCaseTitle(found ? found.title : '');
  };

  const onSubmitUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedCaseId || !selectedFile) {
      alert('Please select a case and choose a file');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('File type not supported. Please upload PDF, images, or documents.');
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Upload Debug:', { selectedCaseId, token: !!token, fileName: selectedFile.name });
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', fileDescription);

      const url = `http://localhost:5000/api/cases/${selectedCaseId}/evidence`;
      console.log('📤 Upload URL:', url);

      const response = await axios.post(
        url,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      alert('Evidence uploaded successfully!');
      closeModal();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to upload evidence. Please try again.';
      alert(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  // Drag & drop helpers (UI only)
  const onDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer?.files?.length) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const triggerHiddenFileInput = () => {
    const input = document.getElementById('dashboard-upload-file-hidden');
    if (input) input.click();
  };

  return (
    <div className="dashboard">
      <AppHeader 
        title="Adhikaran | User Portal"
        userActions={userActions}
      />
      
      <main className="dashboard__main">
        <div className="dashboard__hero">
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__description">Manage your cases and legal proceedings</p>
        </div>

        <div className="dashboard__actions">
          <ActionCard
            type="file-case"
            title="File a New Case"
            description="Start a new legal proceeding or petition"
            onAction={handleFileNewCase}
          />
          <ActionCard
            type="upload-evidence"
            title="Upload Evidence"
            description="Add documents and evidence to existing cases"
            onFileChange={handleFileChange}
            onAction={handleUploadEvidence}
          />
        </div>

        <div className="dashboard__hearings">
          <div className="hearings-list">
            <div className="hearings-list__header">
              <div className="hearings-list__title-section">
                <Calendar size={20} className="hearings-list__icon" />
                <h2 className="hearings-list__title">Upcoming Hearings</h2>
              </div>
              <p className="hearings-list__description">Your scheduled court appearances and hearings</p>
            </div>
            <div className="hearings-list__content">
              {casesLoading && (
                <div style={{ padding: '1rem' }}>Loading cases…</div>
              )}
              {!casesLoading && casesError && (
                <div style={{ padding: '1rem', color: '#b91c1c' }}>{casesError}</div>
              )}
              {!casesLoading && !casesError && cases.length === 0 && (
                <div style={{ padding: '1rem' }}>No cases found for this user.</div>
              )}
              {!casesLoading && !casesError && cases.length > 0 && (
                <>
                  {cases.map((c, idx) => (
                    <HearingCard
                      key={c.caseId || idx}
                      hearing={{
                        id: c.caseId,
                        title: c.title,
                        status: c.status,
                        date: c.date,
                        time: c.time,
                        caseId: c.readableCaseId || c.caseId
                      }}
                      onViewDetails={handleViewDetails}
                      onEditCase={handleEditCase}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Upload Evidence Modal (UI only) */}
        {showUploadModal && (
          <>
            <div className="modal fade show dashboard-upload-modal" style={{ display: 'block' }} role="dialog" aria-modal="true" aria-labelledby="uploadEvidenceLabel">
              <div className="modal-dialog modal-dialog-centered dashboard-upload-modal__dialog" role="document">
                <div className="modal-content dashboard-upload-modal__content">
                  <div className="modal-header dashboard-upload-modal__header">
                    <h5 className="modal-title" id="uploadEvidenceLabel">Upload Evidence</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                  </div>
                  <form onSubmit={onSubmitUpload}>
                    <div className="modal-body dashboard-upload-modal__body">
                      {/* Drag & drop zone (UI only) */}
                      <input id="dashboard-upload-file-hidden" type="file" className="d-none" accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.txt" onChange={handleFileChange} />
                      <div 
                        className={`dashboard-upload-dropzone ${dragActive ? 'dashboard-upload-dropzone--active' : ''}`} 
                        onDragOver={onDragOver} 
                        onDragLeave={onDragLeave} 
                        onDrop={onDrop}
                        onClick={triggerHiddenFileInput}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerHiddenFileInput()}
                        aria-label="Drag file here or click to browse"
                      >
                        <img className="dashboard-upload-dropzone__icon-img" src="/assets/download-icon.png" alt="" />
                        <div className="dashboard-upload-dropzone__title">Drag file here</div>
                        <div className="dashboard-upload-dropzone__subtitle">Or click to browse (10MB max)</div>
                        {selectedFile && (
                          <div className="dashboard-upload-dropzone__file text-muted mt-2">Selected: {selectedFile.name}</div>
                        )}
                      </div>

                      

                      {/* Existing required fields (unchanged, below upload area) */}
                      <div className="mb-3 mt-3">
                        <label className="form-label">Case Title</label>
                        <select className="form-select" value={selectedCaseId} onChange={onCaseIdChange} required>
                          <option value="" disabled>Select a case</option>
                          {cases.map(c => (
                            <option key={c.caseId} value={c.caseId}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      {/* New: Display the Case ID (read-only) from Upcoming Hearings */}
                      <div className="mb-3">
                        <label className="form-label">Selected Case ID</label>
                        <input type="text" className="form-control" value={selectedCaseId} readOnly placeholder="Auto-filled Case ID" />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">File Description</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Enter file description" 
                          value={fileDescription}
                          onChange={(e) => setFileDescription(e.target.value)}
                        />
                      </div>

                      <div className="form-text">Accepted: PDF, images, or documents</div>
                    </div>
                    <div className="modal-footer dashboard-upload-modal__footer">
                      <button type="button" className="btn--secondary" onClick={closeModal} disabled={uploading}>Cancel</button>
                      <button type="submit" className="btn--primary" disabled={uploading || !selectedCaseId || !selectedFile}>
                        {uploading ? 'Uploading...' : 'Upload Evidence'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
