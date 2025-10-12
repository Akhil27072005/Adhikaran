import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from '../components/AppHeader';
import UpcomingCases from "../components/UpcomingCases";
import ClosedCases from "../components/ClosedCases";
import "../styles/judge-cases.css";

const JudgeCases = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");

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
    { label: 'Back to Dashboard', onClick: () => navigate('/judge-dashboard') },
    { label: 'Profile', onClick: handleProfile },
    { label: 'Logout', onClick: handleLogout }
  ];

  return (
    <div className="judge-dashboard">
      <AppHeader 
        title="Adhikaran | Judge Portal"
        userActions={userActions}
      />
      
      <main className="judge-dashboard__main">
        <div className="judge-dashboard__hero">
          <h1 className="judge-dashboard__title">Case Management Dashboard</h1>
          <p className="judge-dashboard__description">Manage and review court cases and proceedings</p>
        </div>

        {/* Tab Buttons */}
        <div className="judge-cases-tabs">
          <button
            className={`judge-cases-tab ${activeTab === "upcoming" ? "judge-cases-tab--active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Cases
          </button>
          <button
            className={`judge-cases-tab ${activeTab === "closed" ? "judge-cases-tab--active" : ""}`}
            onClick={() => setActiveTab("closed")}
          >
            Closed Cases
          </button>
        </div>

        {/* Conditional rendering */}
        <div className="judge-cases-content">
          {activeTab === "upcoming" && <UpcomingCases />}
          {activeTab === "closed" && <ClosedCases />}
        </div>
      </main>
    </div>
  );
};

export default JudgeCases;
