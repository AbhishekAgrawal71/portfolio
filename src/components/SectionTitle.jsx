import React from 'react';
import './SectionTitle.css';

const SectionTitle = ({ title, subtitle }) => {
  return (
    <div className="section-title animate-on-scroll">
      <h2 className="section-title__heading">{title}</h2>
      {subtitle && (
        <p className="section-title__subtitle">{subtitle}</p>
      )}
      <div className="section-title__decoration">
        <span className="section-title__line" />
        <span className="section-title__dot" />
        <span className="section-title__line" />
      </div>
    </div>
  );
};

export default SectionTitle;
