import { Code, Globe, Brain, Library, BookOpen, Wrench, Cpu, Database, Server, Terminal, Laptop } from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioContext';
import SectionTitle from '../components/SectionTitle';
import SkillBadge from '../components/SkillBadge';
import './Skills.css';

// Map icon string names from data to actual lucide-react components
const iconMap = {
  Code,
  Globe,
  Brain,
  Library,
  BookOpen,
  Wrench,
  Cpu,
  Database,
  Server,
  Terminal,
  Laptop,
};

const Skills = () => {
  const { skills, settings } = usePortfolioData();
  const visibleCategories = (skills || []).filter(c => c.isVisible !== false);

  if (settings?.show_skills === 'false' || !visibleCategories || visibleCategories.length === 0) return null;

  return (
    <section id="skills" className="skills-section">
      <div className="skills-container">
        <SectionTitle title="Skills" />

        <div className="skills-grid animate-on-scroll">
          {visibleCategories.map((category, index) => {
            const IconComponent = iconMap[category.icon] || Code;
            return (
              <div className="skills-category-card" key={index}>
                <div className="skills-category-header">
                  <IconComponent size={22} className="skills-category-icon" />
                  <h3 className="skills-category-name">{category.category}</h3>
                </div>
                <div className="skills-badge-list">
                  {category.skills.map((skill, sIndex) => (
                    <SkillBadge key={sIndex} skill={skill} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
