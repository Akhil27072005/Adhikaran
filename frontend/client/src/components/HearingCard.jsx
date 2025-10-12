import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';

const HearingCard = ({ hearing, onViewDetails, onEditCase }) => {
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'confirmed';
      case 'scheduled':
        return 'scheduled';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Card variant="hearing" className="hearing-card">
      <div className="hearing-card__header">
        <h4 className="hearing-card__title">{hearing.title}</h4>
        <Badge variant={getStatusVariant(hearing.status)}>
          {hearing.status}
        </Badge>
      </div>
      
      <div className="hearing-card__details">
        <div className="hearing-card__detail">
          <Calendar size={16} className="hearing-card__icon" />
          <span className="hearing-card__text">{hearing.date}</span>
        </div>
        <div className="hearing-card__detail">
          <Clock size={16} className="hearing-card__icon" />
          <span className="hearing-card__text">{hearing.time}</span>
        </div>
        <div className="hearing-card__detail">
          <span className="hearing-card__case-id">Case ID: {hearing.caseId}</span>
        </div>
      </div>
      
      <div className="hearing-card__actions">
        {hearing.status === 'draft' && onEditCase && (
          <Button 
            variant="primary" 
            size="small"
            onClick={() => onEditCase(hearing.caseId)}
            style={{ marginRight: '8px' }}
          >
            Edit Case
          </Button>
        )}
        <Button 
          variant="secondary" 
          size="small"
          onClick={() => onViewDetails(hearing.id)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default HearingCard;
