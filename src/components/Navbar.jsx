import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioContext';
import './Navbar.css';

const Navbar = ({ activeSection, theme, onToggleTheme, toggleTheme }) => {
  const { personal, projects, experience, education, skills, certificates, achievements, publications, settings } = usePortfolioData();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const handleToggle = onToggleTheme || toggleTheme;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Build nav items dynamically respecting settings and array lengths
  const navItems = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'experience', label: 'Experience', href: '#experience', hidden: settings?.show_experience === 'false' || !experience?.length },
    { id: 'projects', label: 'Projects', href: '#projects', hidden: settings?.show_projects === 'false' || !projects?.length },
    { id: 'skills', label: 'Skills', href: '#skills', hidden: settings?.show_skills === 'false' || !skills?.length },
    { id: 'education', label: 'Education', href: '#education', hidden: settings?.show_education === 'false' || !education?.length },
    { id: 'certificates', label: 'Certificates', href: '#certificates', hidden: settings?.show_certificates === 'false' || !certificates?.length },
    { id: 'achievements', label: 'Achievements', href: '#achievements', hidden: settings?.show_achievements === 'false' || !achievements?.length },
    { id: 'research', label: 'Research', href: '#research', hidden: settings?.show_publications === 'false' || !publications?.length },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ];

  const visibleItems = navItems.filter(item => !item.hidden);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        <a href="#home" className="navbar__logo" onClick={(e) => handleNavClick(e, '#home')}>
          {personal?.name || 'Abhishek Agrawal'}
        </a>

        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {visibleItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`navbar__link ${activeSection === item.id ? 'navbar__link--active' : ''}`}
              onClick={(e) => handleNavClick(e, `#${item.id}`)}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="navbar__actions">
          <button
            className="navbar__theme-toggle"
            onClick={handleToggle}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
