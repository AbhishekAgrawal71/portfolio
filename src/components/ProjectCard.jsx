import React from 'react';
import { ExternalLink, Folder } from 'lucide-react';
import { Github } from './Icons';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const {
    title,
    description,
    technologies = [],
    image,
    github,
    liveDemo,
    featured,
    category,
  } = project || {};

  return (
    <div className={`project-card animate-on-scroll ${featured ? 'project-card--featured' : ''}`}>
      <div className="project-card__image">
        {image ? (
          <img src={image} alt={title} loading="lazy" />
        ) : (
          <div className="project-card__placeholder">
            <Folder size={48} />
          </div>
        )}
        {featured && <span className="project-card__badge">Featured</span>}
        {category && <span className="project-card__category">{category}</span>}
      </div>

      <div className="project-card__content">
        <h3 className="project-card__title">{title}</h3>
        <p className="project-card__description">{description}</p>

        {technologies.length > 0 && (
          <div className="project-card__tech">
            {technologies.map((tech, index) => (
              <span key={index} className="project-card__tech-badge">{tech}</span>
            ))}
          </div>
        )}

        <div className="project-card__actions">
          {github && github.trim() !== '' && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__btn project-card__btn--github"
            >
              <Github size={16} />
              GitHub
            </a>
          )}
          {liveDemo && liveDemo.trim() !== '' && (
            <a
              href={liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__btn project-card__btn--demo"
            >
              <ExternalLink size={16} />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
