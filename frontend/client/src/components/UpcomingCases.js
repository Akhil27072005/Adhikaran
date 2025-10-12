import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "./Card";
import Button from "./Button";
import "../styles/judge-cases.css";  

const UpcomingCases = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleViewSummary = (caseId) => {
    navigate(`/cases/${caseId}/summary`);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get("http://localhost:5000/api/cases/upcoming", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        setCases(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="judge-cases-loading">
      Loading upcoming cases...
    </div>
  );
  
  if (!cases.length) return (
    <div className="judge-cases-empty">
      <div className="judge-cases-empty-icon">📋</div>
      <div className="judge-cases-empty-title">No Upcoming Cases</div>
      <div className="judge-cases-empty-description">No cases are currently scheduled for upcoming hearings.</div>
    </div>
  );

  return (
    <div className="judge-cases-upcoming">
      {cases.map(c => (
        <Card key={c.caseId} className="judge-cases-upcoming-item">
          <div className="judge-cases-upcoming-header">
            <h3 className="judge-cases-upcoming-title">{c.title}</h3>
            <span className="judge-cases-upcoming-status">{c.status}</span>
          </div>
          
          <div className="judge-cases-upcoming-details">
            <div className="judge-cases-upcoming-detail">
              <div className="judge-cases-upcoming-detail-label">Case Type</div>
              <div className="judge-cases-upcoming-detail-value">{c.type}</div>
            </div>
            <div className="judge-cases-upcoming-detail">
              <div className="judge-cases-upcoming-detail-label">Next Hearing</div>
              <div className="judge-cases-upcoming-detail-value">{c.nextHearing || "TBD"}</div>
            </div>
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="primary" 
              size="small"
              onClick={() => handleViewSummary(c.caseId)}
            >
              View Summary
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UpcomingCases;
