import React, { useMemo, useState, useEffect, useRef } from 'react';
import AppHeader from '../components/AppHeader';
import '../styles/addcase.css';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const CASE_TYPES = ['Civil', 'Criminal', 'Family', 'Property', 'Corporate'];

// Backend-integrated: dynamic suggestions will replace mocks

export default function AddCase(){
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const [form, setForm] = useState({
    title: '',
    type: '',
    description: '',
    defendantName: '',
    defendantEmail: '',
    defendantContact: '',
    city: '',
    lawyerId: '',
  });

  // Track selected defendant id for submission
  const [defendantId, setDefendantId] = useState('');

  // Lawyers fetched from backend suggestions
  const [lawyers, setLawyers] = useState([]);
  const [lawyersLoading, setLawyersLoading] = useState(false);
  const [lawyersError, setLawyersError] = useState('');

  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState(null); // { type: 'success'|'info'|'danger', text: string }
  const [showNameSuggest, setShowNameSuggest] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [userSuggestLoading, setUserSuggestLoading] = useState(false);
  const userSuggestTimer = useRef(null);
  const [caseLoading, setCaseLoading] = useState(false);

  // Lawyers displayed in dropdown
  const filteredLawyers = useMemo(() => {
    return lawyers.map(l => ({ id: l._id, name: `${l.name}`, city: l.city, type: l.jurisdiction }));
  }, [lawyers]);

  // Fetch user suggestions (defendant search) with debounce
  useEffect(() => {
    const q = form.defendantName.trim();
    if (userSuggestTimer.current) {
      clearTimeout(userSuggestTimer.current);
    }
    if (!q || q.length < 2) {
      setUserSuggestions([]);
      return;
    }
    userSuggestTimer.current = setTimeout(async () => {
      try {
        setUserSuggestLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/users/search', {
          params: { q },
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setUserSuggestions(Array.isArray(data?.users) ? data.users : []);
      } catch (_) {
        setUserSuggestions([]);
      } finally {
        setUserSuggestLoading(false);
      }
    }, 300);
    return () => {
      if (userSuggestTimer.current) clearTimeout(userSuggestTimer.current);
    };
  }, [form.defendantName]);

  // Auto-fetch lawyers when both type and city are selected
  useEffect(() => {
    const fetchLawyers = async () => {
      const city = form.city?.trim();
      const type = form.type?.trim();
      if (!city || !type) {
        setLawyers([]);
        return;
      }
      setLawyersLoading(true);
      setLawyersError('');
      try {
        const jurisdiction = String(type).toLowerCase();
        const token = localStorage.getItem('token');
        // Endpoint path as per backend consolidation under userRoutes: /api/suggestions
        const { data } = await axios.get('http://localhost:5000/api/suggestions', {
          params: { city, jurisdiction },
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setLawyers(Array.isArray(data?.lawyers) ? data.lawyers : []);
      } catch (e) {
        setLawyers([]);
        setLawyersError('Failed to load lawyers');
      } finally {
        setLawyersLoading(false);
      }
    };
    fetchLawyers();
  }, [form.city, form.type]);

  // Load case data when in edit mode
  useEffect(() => {
    if (!isEditMode || !id) return;
    
    const loadCaseData = async () => {
      setCaseLoading(true);
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:5000/api/cases/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        // Pre-fill form with case data
        setForm({
          title: data.title || '',
          type: data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : '',
          description: data.description || '',
          defendantName: data.defendant?.fullName || '',
          defendantEmail: data.defendant?.email || '',
          defendantContact: data.defendant?.phone || '',
          city: data.city || '',
          lawyerId: data.assigned_lawyer?._id || '',
        });
        
        // Set defendant ID for submission
        if (data.defendant?._id) {
          setDefendantId(data.defendant._id);
        }
      } catch (err) {
        setMessage({ type: 'danger', text: 'Failed to load case data' });
      } finally {
        setCaseLoading(false);
      }
    };
    
    loadCaseData();
  }, [isEditMode, id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const requiredErrors = useMemo(() => {
    return {
      title: !form.title,
      type: !form.type,
      description: !form.description,
      defendantName: !form.defendantName,
      city: !form.city,
    };
  }, [form]);

  // For drafts, only title and type are required
  const draftRequiredErrors = useMemo(() => {
    return {
      title: !form.title,
      type: !form.type,
    };
  }, [form]);

  const isInvalid = (field) => touched[field] && requiredErrors[field];
  const isDraftInvalid = (field) => touched[field] && draftRequiredErrors[field];

  const payload = () => ({
    ...form,
    lawyer: filteredLawyers.find(l => String(l.id) === String(form.lawyerId)) || null,
    defendantId: defendantId || '',
    submittedAt: new Date().toISOString(),
  });

  const saveDraft = async (e) => {
    e.preventDefault();
    // For drafts, only require title and type - other fields are optional
    if (!form.title.trim()) {
      setMessage({ type: 'danger', text: 'Case title is required for drafts.' });
      return;
    }
    if (!form.type.trim()) {
      setMessage({ type: 'danger', text: 'Case type is required for drafts.' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const body = {
        title: form.title,
        type: String(form.type).toLowerCase(),
        description: form.description,
        defendantId,
        city: form.city,
        lawyerId: form.lawyerId || null,
        draft: true
      };
      const url = isEditMode ? `http://localhost:5000/api/cases/${id}/update` : 'http://localhost:5000/api/cases/add';
      const method = isEditMode ? 'put' : 'post';
      
      const { data } = await axios[method](url, body, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      setMessage({ type: 'success', text: data?.message || 'Draft saved.' });
      navigate('/user-dashboard', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save draft.';
      setMessage({ type: 'danger', text: msg });
    }
  };

  const submitCase = async (e) => {
    e.preventDefault();
    // Touch all for validation feedback
    setTouched({ title: true, type: true, description: true, defendantName: true, city: true });
    if (Object.values(requiredErrors).some(Boolean)) {
      setMessage({ type: 'danger', text: 'Please complete all required fields.' });
      return;
    }
    if (!defendantId) {
      setMessage({ type: 'danger', text: 'Please pick a defendant from suggestions.' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const body = {
        title: form.title,
        type: String(form.type).toLowerCase(),
        description: form.description,
        defendantId,
        city: form.city,
        lawyerId: form.lawyerId || null,
        draft: false
      };
      const url = isEditMode ? `http://localhost:5000/api/cases/${id}/update` : 'http://localhost:5000/api/cases/add';
      const method = isEditMode ? 'put' : 'post';
      
      const { data } = await axios[method](url, body, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      setMessage({ type: 'success', text: data?.message || 'Case submitted successfully.' });
      navigate('/user-dashboard', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit case.';
      setMessage({ type: 'danger', text: msg });
    }
  };

  const handlePickSuggestion = (p) => {
    setDefendantId(p._id);
    setForm(prev => ({ ...prev, defendantName: p.name, defendantEmail: p.email, defendantContact: p.phone || '' }));
    setShowNameSuggest(false);
  };

  const userActions = [
    { label: 'Back to Dashboard', onClick: () => window.location.assign('/user-dashboard') }
  ];

  return (
    <div className="addcase-page">
      <AppHeader title="Adhikaran | User Portal" userActions={userActions} />

      <main className="addcase-main container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card addcase-card">
              <div className="card-body">
                <div className="addcase-header">
      <h1 className="addcase-title">{isEditMode ? 'Edit Case' : 'Register a New Case'}</h1>

                </div>

                {message && (
                  <div className={`alert alert-${message.type} addcase-alert`} role="alert">{message.text}</div>
                )}

                <form onSubmit={submitCase} noValidate>
                  {/* Row 1: Title, Type */}
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label">Case Title <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className={`form-control ${isInvalid('title') ? 'is-invalid' : ''}`}
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder="Enter case title" />
                      {isInvalid('title') && <div className="invalid-feedback">Case title is required.</div>}
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label">Case Type <span className="text-danger">*</span></label>
                      <select 
                        className={`form-select ${isInvalid('type') ? 'is-invalid' : ''}`}
                        name="type"
                        value={form.type}
                        onChange={onChange}
                        onBlur={onBlur}>
                        <option value="">Select type</option>
                        {CASE_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
                      </select>
                      {isInvalid('type') && <div className="invalid-feedback">Case type is required.</div>}
                    </div>
                  </div>

                  {/* Row 2: Description */}
                  <div className="row g-3 mt-1">
                    <div className="col-12">
                      <label className="form-label">Description {!isEditMode && <span className="text-danger">*</span>}</label>
                      <textarea 
                        rows={4}
                        className={`form-control ${isInvalid('description') ? 'is-invalid' : ''}`}
                        name="description"
                        value={form.description}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder="Provide a concise summary of the case"></textarea>
                      {isInvalid('description') && <div className="invalid-feedback">Description is required.</div>}
                    </div>
                  </div>

                  {/* Row 3: Defendant */}
                  <div className="row g-3 mt-1">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Defendant Name {!isEditMode && <span className="text-danger">*</span>}</label>
                      <div className="position-relative">
                        <input 
                          type="text" 
                          className={`form-control ${isInvalid('defendantName') ? 'is-invalid' : ''}`}
                          name="defendantName"
                          value={form.defendantName}
                          onChange={(e) => { onChange(e); setShowNameSuggest(true); }}
                          onFocus={() => setShowNameSuggest(true)}
                          onBlur={(e) => { setTimeout(() => setShowNameSuggest(false), 120); onBlur(e); }}
                          placeholder="Enter defendant name" />
                        {isInvalid('defendantName') && <div className="invalid-feedback">Defendant name is required.</div>}

                        {showNameSuggest && (userSuggestLoading || userSuggestions.length > 0) && (
                          <ul className="addcase-suggest list-unstyled m-0">
                            {userSuggestLoading && (
                              <li className="px-3 py-2 text-muted">Searching…</li>
                            )}
                            {!userSuggestLoading && userSuggestions.map(p => (
                              <li key={p._id}>
                                <button type="button" className="addcase-suggest__btn" onClick={() => handlePickSuggestion(p)}>
                                  <span className="addcase-suggest__name">{p.name}</span>
                                  <span className="addcase-suggest__meta">{p.email} • {p.city}{p.phone ? ` • ${p.phone}` : ''}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="col-12 col-md-3">
                      <label className="form-label">Defendant Email</label>
                      <input 
                        type="email" 
                        className="form-control"
                        name="defendantEmail"
                        value={form.defendantEmail}
                        onChange={onChange}
                        placeholder="Auto-filled if known" />
                    </div>
                    <div className="col-12 col-md-3">
                      <label className="form-label">Defendant Contact</label>
                      <input 
                        type="text" 
                        className="form-control"
                        name="defendantContact"
                        value={form.defendantContact}
                        onChange={onChange}
                        placeholder="Auto-filled if known" />
                    </div>
                  </div>

                  {/* Row 4: City + Lawyer */}
                  <div className="row g-3 mt-1">
                    <div className="col-12 col-md-4">
                      <label className="form-label">City / Jurisdiction {!isEditMode && <span className="text-danger">*</span>}</label>
                      <input 
                        type="text" 
                        className={`form-control ${isInvalid('city') ? 'is-invalid' : ''}`}
                        name="city"
                        value={form.city}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder="Enter city" />
                      {isInvalid('city') && <div className="invalid-feedback">City / Jurisdiction is required.</div>}
                    </div>
                    <div className="col-12 col-md-8">
                      <label className="form-label">Select Lawyer</label>
                      <select 
                        className="form-select"
                        name="lawyerId"
                        value={form.lawyerId}
                        onChange={onChange}
                      >
                        <option value="">Select lawyer (filtered by type & city)</option>
                        {lawyersLoading && (<option value="" disabled>Loading lawyers…</option>)}
                        {!lawyersLoading && filteredLawyers.map(l => (<option key={l.id} value={l.id}>{l.name} — {l.city}</option>))}
                      </select>
                      <div className="form-text">Filtering based on Case Type and City.</div>
                      {lawyersError && <div className="text-danger small mt-1">{lawyersError}</div>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="addcase-actions mt-4 d-flex justify-content-end gap-2">
                    {caseLoading && (
                      <div className="text-muted">Loading case data...</div>
                    )}
                    {!caseLoading && (
                      <>
                        <button className="btn btn--secondary" onClick={saveDraft} type="button">
                          {isEditMode ? 'Update Draft' : 'Save as Draft'}
                        </button>
                        <button className="btn btn--primary" type="submit">
                          {isEditMode ? 'File Case' : 'Submit Case'}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
