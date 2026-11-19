import React from 'react';
import { Award } from 'lucide-react';
import './AchievementCard.css';

const AchievementCard = ({ achievement }) => {
  const {
    title,
    organization,
    year,
    date,
    description,
  } = achievement || {};

  const displayYear = year || date;

  return (
    <div className="achievement-card animate-on-scroll">
      <div className="achievement-card__icon">
        <Award size={24} />
      </div>
      <div className="achievement-card__content">
        <h3 className="achievement-card__title">{title}</h3>
        {organization && (
          <p className="achievement-card__org">{organization}</p>
        )}
        {displayYear && (
          <span className="achievement-card__year">{displayYear}</span>
        )}
        {description && (
          <p className="achievement-card__description">{description}</p>
        )}
      </div>
    </div>
  );
};

export default AchievementCard;
