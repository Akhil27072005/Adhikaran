import React from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';
import Card from './Card';
import Button from './Button';

const JudgeHearingCard = ({ hearing, onViewDetails, onStartHearing }) => {
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'confirmed';
      case 'scheduled':
        return 'scheduled';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority) => {
    if (!priority) return 'default';
    const value = priority.toLowerCase();
    if (value.includes('high')) return 'danger';
    if (value.includes('medium')) return 'warning';
    return 'default';
  };

  return (
    <Card variant="hearing" className="hearing-card">
      <div className="hearing-card__header" aria-label="Hearing header">
        <h4 className="hearing-card__title">{hearing.title}</h4>
        {hearing.priority && (
          <span className={`priority-chip priority-chip--${getPriorityVariant(hearing.priority)}`} aria-label={`Priority ${hearing.priority}`}>
            {hearing.priority}
          </span>
        )}
      </div>
      
      <div className="hearing-card__details" aria-label="Hearing details">
        <div className="hearing-card__detail">
          <Clock size={16} className="hearing-card__icon" />
          <span className="hearing-card__text">{hearing.time}</span>
        </div>
        <div className="hearing-card__detail">
          <FileText size={16} className="hearing-card__icon" />
          <span className="hearing-card__text">{hearing.type}</span>
        </div>
        <div className="hearing-card__detail">
          <Calendar size={16} className="hearing-card__icon" />
          <span className="hearing-card__text">{hearing.date}</span>
        </div>
        <div className="hearing-card__detail">
          <span className="hearing-card__case-pill">{hearing.readableCaseId || hearing.caseId}</span>
        </div>
      </div>
      
      <div className="hearing-card__actions">
        <Button 
          variant="secondary" 
          size="small"
          onClick={() => onViewDetails?.(hearing.id)}
        >
          Review Case
        </Button>
      </div>
    </Card>
  );
};

export default JudgeHearingCard;
