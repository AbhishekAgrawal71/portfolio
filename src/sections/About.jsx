import { GraduationCap, Award, Target } from 'lucide-react';
import personal from '../data/personal';
import SectionTitle from '../components/SectionTitle';
import './About.css';

const About = () => {
  const stats = [
    { icon: <GraduationCap size={24} />, label: 'Education', value: 'CS @ UPES' },
    { icon: <Award size={24} />, label: 'CGPA', value: '8.9 / 10' },
    { icon: <Target size={24} />, label: 'Focus', value: 'Software Dev & ML' },
  ];

  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <SectionTitle title="About Me" />

        <div className="about-content animate-on-scroll">
          <div className="about-text">
            {personal.aboutMe && (
              <p className="about-description">{personal.aboutMe}</p>
            )}
          </div>

          <div className="about-stats">
            {stats.map((stat, index) => (
              <div className="about-stat-card animate-on-scroll" key={index}>
                <div className="about-stat-icon">{stat.icon}</div>
                <div className="about-stat-info">
                  <span className="about-stat-value">{stat.value}</span>
                  <span className="about-stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
