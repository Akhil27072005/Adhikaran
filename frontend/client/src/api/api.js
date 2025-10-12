// src/api/api.js
// Axios-based API client with identical behavior to previous fetch version
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

// Create an Axios instance with defaults
// - baseURL from env
// - JSON content type
// - withCredentials off by default (enable if you rely on cookies)
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Optional: attach JWT from storage under key 'token' (fallback to 'accessToken')
// Components do NOT need to change; if a token exists, it's added automatically.
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken') || sessionStorage.getItem('token') || sessionStorage.getItem('accessToken')) : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to normalize Axios errors to match prior fetch error shape
function toFetchStyleError(error) {
  if (error.response) {
    const err = new Error(error.response.data?.message || error.response.statusText || 'API error');
    err.status = error.response.status;
    err.body = error.response.data;
    return err;
  }
  if (error.request) {
    const err = new Error('Network error');
    err.status = 0;
    err.body = null;
    return err;
  }
  const err = new Error(error.message || 'API error');
  err.status = 0;
  err.body = null;
  return err;
}

// Unified request wrapper preserving previous semantics
async function request(path, opts = {}) {
  try {
    const method = (opts.method || 'GET').toLowerCase();
    const config = { url: path, method };

    if (opts.headers) {
      config.headers = { ...(opts.headers || {}) };
    }

    if (opts.body !== undefined) {
      // fetch used JSON.stringified body; axios uses `data`
      config.data = typeof opts.body === 'string' ? JSON.parse(opts.body) : opts.body;
    }

    const response = await api.request(config);
    return response.data;
  } catch (error) {
    throw toFetchStyleError(error);
  }
}

// API functions (preserve signatures and returned data)
export const fetchCaseSummary = (caseId) => request(`/cases/${caseId}/summary`, { method: 'GET' });
