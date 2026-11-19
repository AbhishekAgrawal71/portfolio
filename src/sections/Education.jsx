import { GraduationCap, Calendar, Award } from 'lucide-react';
import education from '../data/education';
import SectionTitle from '../components/SectionTitle';
import './Education.css';

const Education = () => {
  if (!education || education.length === 0) return null;

  return (
    <section id="education" className="education-section">
      <div className="education-container">
        <SectionTitle title="Education" />

        <div className="education-timeline animate-on-scroll">
          {education.map((edu, index) => (
            <div className="education-card" key={index}>
              <div className="education-card-icon">
                <GraduationCap size={28} />
              </div>
              <div className="education-card-content">
                <h3 className="education-university">{edu.university}</h3>
                <p className="education-degree">{edu.degree}</p>
                <div className="education-meta">
                  {edu.duration && (
                    <span className="education-meta-item">
                      <Calendar size={14} /> {edu.duration}
                    </span>
                  )}
                  {edu.cgpa && (
                    <span className="education-meta-item">
                      <Award size={14} /> CGPA: {edu.cgpa}
                    </span>
                  )}
                </div>
                {edu.status && (
                  <span className="education-status">{edu.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
