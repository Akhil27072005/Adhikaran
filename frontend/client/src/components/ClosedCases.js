import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "./Card";
import Button from "./Button";
import "../styles/judge-cases.css";

const ClosedCases = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleViewSummary = (caseId) => {
    navigate(`/cases/${caseId}/summary`);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get("http://localhost:5000/api/cases/closed", {
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
      Loading closed cases...
    </div>
  );
  
  if (!cases.length) return (
    <div className="judge-cases-empty">
      <div className="judge-cases-empty-icon">✅</div>
      <div className="judge-cases-empty-title">No Closed Cases</div>
      <div className="judge-cases-empty-description">No cases have been closed yet.</div>
    </div>
  );

  return (
    <div className="judge-cases-closed">
      {cases.map(c => (
        <Card key={c.caseId} className="judge-cases-closed-item">
          <div className="judge-cases-closed-header">
            <h3 className="judge-cases-closed-title">{c.title}</h3>
            <span className="judge-cases-closed-verdict">{c.verdict || "Closed"}</span>
          </div>
          
          <div className="judge-cases-closed-details">
            <div className="judge-cases-closed-detail">
              <div className="judge-cases-closed-detail-label">Case Type</div>
              <div className="judge-cases-closed-detail-value">{c.type}</div>
            </div>
            <div className="judge-cases-closed-detail">
              <div className="judge-cases-closed-detail-label">Judgment Date</div>
              <div className="judge-cases-closed-detail-value">{c.judgmentDate || "N/A"}</div>
            </div>
          </div>
          
          {c.summary && (
            <div className="judge-cases-closed-summary">
              <div className="judge-cases-closed-summary-label">Case Summary</div>
              <div className="judge-cases-closed-summary-text">{c.summary}</div>
            </div>
          )}
          
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

export default ClosedCases;
