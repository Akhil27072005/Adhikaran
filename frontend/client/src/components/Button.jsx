import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className = '', 
  onClick,
  type = 'button',
  disabled = false 
}) => {
  return (
    <button 
      type={type}
      className={`btn--${variant} btn--${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
