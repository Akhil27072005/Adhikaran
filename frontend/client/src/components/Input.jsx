import React from 'react';

const Input = ({ 
  placeholder = '', 
  className = '', 
  value,
  onChange,
  type = 'text',
  disabled = false 
}) => {
  return (
    <input 
      type={type}
      className={`input ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

export default Input;
