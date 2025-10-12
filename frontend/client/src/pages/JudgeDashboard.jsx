import React, { useState, useEffect } from 'react';
import { Calendar, Bell, FileText, Users } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JudgeHearingCard from '../components/JudgeHearingCard';
import { formatDate } from '../utils/dateUtils';
import '../styles/judge-dashboard.css';

// Actions will be created inside component to access navigate

const JudgeDashboard = () => {
  const navigate = useNavigate();
  
  // State for real data
  const [hearings, setHearings] = useState([]);
  const [stats, setStats] = useState([
    { id: 'today', icon: Calendar, value: 0, label: "Today's Hearings" },
    { id: 'pending', icon: FileText, value: 0, label: 'Pending Cases' },
    { id: 'alerts', icon: Bell, value: 0, label: 'Active Alerts' },
    { id: 'month', icon: Users, value: 0, label: 'Cases This Month' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch hearings data and calculate stats
  useEffect(() => {
    const fetchHearings = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/cases/judge/hearings', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        const hearingsData = data.hearings || [];
        setHearings(hearingsData);
        
        // Calculate stats from real data
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const todayHearings = hearingsData.filter(h => h.next_hearing_date === today).length;
        const pendingCases = hearingsData.filter(h => h.status === 'filed' || h.status === 'under_review').length;
        const activeAlerts = hearingsData.filter(h => h.priority === 'high').length;
        const monthHearings = hearingsData.filter(h => {
          if (!h.next_hearing_date) return false;
          const hearingDate = new Date(h.next_hearing_date);
          return hearingDate.getMonth() === currentMonth && hearingDate.getFullYear() === currentYear;
        }).length;
        
        setStats([
          { id: 'today', icon: Calendar, value: todayHearings, label: "Today's Hearings" },
          { id: 'pending', icon: FileText, value: pendingCases, label: 'Pending Cases' },
          { id: 'alerts', icon: Bell, value: activeAlerts, label: 'Active Alerts' },
          { id: 'month', icon: Users, value: monthHearings, label: 'Cases This Month' }
        ]);
        
      } catch (err) {
        console.error('Error fetching hearings:', err);
        setError('Failed to load hearings data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHearings();
  }, []);

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
    { label: 'Cases', onClick: () => navigate('/judge/cases') },
    { label: 'Profile', onClick: handleProfile },
    { label: 'Logout', onClick: handleLogout }
  ];
  const handleViewDetails = (hearingId) => {
    // Navigate to case summary page with the case ID
    navigate(`/cases/${hearingId}/summary`);
  };

  const handleStartHearing = (hearingId) => {
    // TODO: Start hearing flow
    console.log('Start hearing for:', hearingId);
  };

  const handleReviewAlert = (alertId) => {
    // TODO: Handle alert review
    console.log('Review alert:', alertId);
  };

  return (
    <div className="judge-dashboard">
      <AppHeader 
        title="Adhikaran | Judge Portal"
        userActions={userActions}
      />
      
      <main className="judge-dashboard__main">
        <div className="judge-dashboard__hero">
          <h1 className="judge-dashboard__title">Judicial Dashboard</h1>
          <p className="judge-dashboard__description">Manage court proceedings and case reviews</p>
        </div>
   

        {/* Hearings Today */}
        <div className="judge-dashboard__hearings">
          <div className="hearings-list">
            <div className="hearings-list__header">
              <div className="hearings-list__title-section">
                <Calendar size={20} className="hearings-list__icon" />
                <h2 className="hearings-list__title">Upcoming Hearings</h2>
                <span className="count-badge" aria-label={`Total hearings ${hearings.length}`}>{hearings.length}</span>
              </div>
              <p className="hearings-list__description">Scheduled court sessions for today</p>
            </div>
            <div className="hearings-list__content">
              {loading && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  Loading hearings...
                </div>
              )}
              {error && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
                  {error}
                </div>
              )}
              {!loading && !error && hearings.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No hearings scheduled.
                </div>
              )}
              {!loading && !error && hearings.length > 0 && hearings.map((hearing, index) => (
                <JudgeHearingCard
                  key={hearing.caseId || index}
                  hearing={{
                    id: hearing.caseId,
                    title: hearing.case_title,
                    priority: hearing.priority,
                    status: hearing.status,
                    date: hearing.next_hearing_date || 'TBD',
                    time: hearing.next_hearing_time || 'TBD',
                    type: hearing.case_type,
                    caseId: hearing.caseId,
                    readableCaseId: hearing.readableCaseId
                  }}
                  onViewDetails={handleViewDetails}
                  onStartHearing={handleStartHearing}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <section className="stats" aria-label="Dashboard statistics">
          <div className="stats__grid">
            {stats.map((s) => (
              <div key={s.id} className="stat-card">
                <div className="stat-card__icon" aria-hidden>
                  <s.icon size={18} />
                </div>
                <div className="stat-card__value">{s.value}</div>
                <div className="stat-card__label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Content to Fill Space */}
        <section className="dashboard-footer" style={{ marginTop: '48px', paddingBottom: '48px' }}>
          <div className="dashboard-footer__content" style={{ 
            background: '#FFFFFF', 
            border: '1px solid #E5E5E5', 
            borderRadius: '8px', 
            padding: '24px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333333', margin: '0 0 8px 0' }}>
              Judicial Management System
            </h3>
            <p style={{ fontSize: '14px', color: '#555555', margin: '0' }}>
              Efficient case management and hearing scheduling for judicial proceedings
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default JudgeDashboard;
