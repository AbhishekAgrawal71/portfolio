import { useState, useMemo } from 'react';
import projects from '../data/projects';
import SectionTitle from '../components/SectionTitle';
import ProjectCard from '../components/ProjectCard';
import './Projects.css';

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = useMemo(() => {
    const cats = [...new Set(projects.map((p) => p.category).filter(Boolean))];
    return ['All', ...cats];
  }, []);

  const filteredProjects = useMemo(() => {
    let filtered = activeFilter === 'All'
      ? [...projects]
      : projects.filter((p) => p.category === activeFilter);

    // Featured projects first
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return filtered;
  }, [activeFilter]);

  if (!projects || projects.length === 0) return null;

  return (
    <section id="projects" className="projects-section">
      <div className="projects-container">
        <SectionTitle title="Projects" />

        <div className="projects-filters animate-on-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`projects-filter-btn ${activeFilter === cat ? 'projects-filter-active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="projects-grid animate-on-scroll">
          {filteredProjects.map((project) => (
            <div
              className={`projects-grid-item ${project.featured ? 'projects-featured' : ''}`}
              key={project.id}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
