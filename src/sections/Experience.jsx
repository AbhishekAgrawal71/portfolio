import experience from '../data/experience';
import SectionTitle from '../components/SectionTitle';
import ExperienceCard from '../components/ExperienceCard';
import './Experience.css';

const Experience = () => {
  if (!experience || experience.length === 0) return null;

  return (
    <section id="experience" className="experience-section">
      <div className="experience-container">
        <SectionTitle title="Experience" />

        <div className="experience-timeline animate-on-scroll">
          {experience.map((exp, index) => (
            <div className="experience-timeline-item" key={exp.id || index}>
              <div className="experience-timeline-connector">
                <div className="experience-timeline-dot"></div>
                {index < experience.length - 1 && (
                  <div className="experience-timeline-line"></div>
                )}
              </div>
              <div className="experience-timeline-content">
                <ExperienceCard experience={exp} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
