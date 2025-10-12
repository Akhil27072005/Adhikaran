import React from 'react';

const Card = ({ children, className = '', variant = 'default' }) => {
  return (
    <div className={`card-dashboard card--${variant} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
