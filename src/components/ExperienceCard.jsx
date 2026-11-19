import React from 'react';
import { Briefcase, Calendar } from 'lucide-react';
import './ExperienceCard.css';

const ExperienceCard = ({ experience }) => {
  const {
    role,
    company,
    duration,
    type,
    responsibilities = [],
    description,
  } = experience || {};

  return (
    <div className="experience-card animate-on-scroll">
      <div className="experience-card__timeline">
        <div className="experience-card__dot" />
        <div className="experience-card__line" />
      </div>

      <div className="experience-card__body">
        <div className="experience-card__header">
          <div className="experience-card__icon">
            <Briefcase size={20} />
          </div>
          <div className="experience-card__meta">
            <h3 className="experience-card__role">{role}</h3>
            <p className="experience-card__company">{company}</p>
            <div className="experience-card__info">
              {duration && (
                <span className="experience-card__duration">
                  <Calendar size={14} />
                  {duration}
                </span>
              )}
              {type && (
                <span className="experience-card__type">{type}</span>
              )}
            </div>
          </div>
        </div>

        {description && (
          <p className="experience-card__description">{description}</p>
        )}

        {responsibilities.length > 0 && (
          <ul className="experience-card__responsibilities">
            {responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExperienceCard;
