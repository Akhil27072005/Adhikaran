import React from 'react';
import { Scale } from 'lucide-react';

const AppHeader = ({ title, userActions = [] }) => {
  return (
    <header className="app-header">
      <div className="app-header__container">
        <div className="app-header__branding">
          <div className="app-header__logo">
            <Scale size={24} />
          </div>
          <h1 className="app-header__title">{title}</h1>
        </div>
        
        <nav className="app-header__nav">
          {userActions.map((action, index) => (
            <button 
              key={index}
              className="app-header__nav-button"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
