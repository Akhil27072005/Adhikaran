import React from 'react';
import { Plus, Upload } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Input from './Input';

const ActionCard = ({ type, title, description, onAction, onFileChange }) => {
  const renderContent = () => {
    if (type === 'file-case') {
      return (
        <>
          <div className="action-card__header">
            <Plus size={20} className="action-card__icon" />
            <h3 className="action-card__title">{title}</h3>
          </div>
          <p className="action-card__description">{description}</p>
          <Button 
            variant="primary" 
            size="large" 
            className="action-card__button"
            onClick={onAction}
          >
            File New Case
          </Button>
        </>
      );
    }
    
    if (type === 'upload-evidence') {
      return (
        <>
          <div className="action-card__header">
            <Upload size={20} className="action-card__icon" />
            <h3 className="action-card__title">{title}</h3>
          </div>
          <p className="action-card__description">{description}</p>
          
          <Button 
            variant="secondary" 
            size="large" 
            className="action-card__button"
            onClick={onAction}
          >
            Upload Evidence
          </Button>
        </>
      );
    }
    
    return null;
  };

  return (
    <Card variant="action" className="action-card">
      {renderContent()}
    </Card>
  );
};

export default ActionCard;
