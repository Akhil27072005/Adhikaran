import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  return (
    <span className={`badge_ badge--${variant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
