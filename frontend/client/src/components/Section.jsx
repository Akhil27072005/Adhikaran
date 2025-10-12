import React from 'react';
import { Calendar } from 'lucide-react';

const Section = ({ title, description, icon: Icon, children, className = '' }) => {
  return (
    <section className={`section ${className}`}>
      <div className="section__header">
        {Icon && <Icon size={20} className="section__icon" />}
        <h2 className="section__title">{title}</h2>
      </div>
      {description && (
        <p className="section__description">{description}</p>
      )}
      <div className="section__content">
        {children}
      </div>
    </section>
  );
};

export default Section;
