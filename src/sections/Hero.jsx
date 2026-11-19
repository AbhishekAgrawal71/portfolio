import { useState, useEffect } from 'react';
import { Download, ArrowDown, Mail, ChevronDown } from 'lucide-react';
import { Github } from '../components/Icons';
import personal from '../data/personal';
import './Hero.css';

const Hero = () => {
  const [currentTagline, setCurrentTagline] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!personal.taglines || personal.taglines.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentTagline((prev) => (prev + 1) % personal.taglines.length);
        setFade(true);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero-section">
      <div className="hero-bg-decoration" aria-hidden="true">
        <div className="hero-gradient-orb hero-orb-1"></div>
        <div className="hero-gradient-orb hero-orb-2"></div>
        <div className="hero-grid-pattern"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content animate-on-scroll">
          <div className="hero-text">
            <p className="hero-greeting">Hello, I'm</p>
            <h1 className="hero-name">{personal.name}</h1>

            {personal.taglines && personal.taglines.length > 0 && (
              <div className="hero-tagline-wrapper">
                <span className={`hero-tagline ${fade ? 'hero-tagline-visible' : 'hero-tagline-hidden'}`}>
                  {personal.taglines[currentTagline]}
                </span>
              </div>
            )}

            {personal.bio && (
              <p className="hero-bio">{personal.bio}</p>
            )}

            <div className="hero-buttons">
              <button
                className="hero-btn hero-btn-primary"
                onClick={() => scrollTo('projects')}
              >
                View Projects <ArrowDown size={16} />
              </button>

              {personal.resumePath && (
                <a
                  href={personal.resumePath}
                  className="hero-btn hero-btn-secondary"
                  download
                >
                  <Download size={16} /> Download Resume
                </a>
              )}

              {personal.github && (
                <a
                  href={personal.github}
                  className="hero-btn hero-btn-outline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={16} /> GitHub
                </a>
              )}

              <button
                className="hero-btn hero-btn-outline"
                onClick={() => scrollTo('contact')}
              >
                <Mail size={16} /> Contact Me
              </button>
            </div>
          </div>

          <div className="hero-image-area">
            <div className="hero-image-frame">
              <img
                src={personal.profileImage}
                alt={`${personal.name} profile`}
                className="hero-profile-img"
              />
            </div>
          </div>
        </div>

        <div className="hero-scroll-indicator" onClick={() => scrollTo('about')}>
          <span>Scroll Down</span>
          <ChevronDown size={20} className="hero-chevron-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
