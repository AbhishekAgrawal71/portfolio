import React from 'react';
import './SkillBadge.css';

const SkillBadge = ({ name, skill }) => {
  const label = name || skill;
  if (!label) return null;

  return (
    <span className="skill-badge">
      {label}
    </span>
  );
};

export default SkillBadge;
