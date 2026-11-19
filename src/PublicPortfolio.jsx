import React from 'react';
import { useTheme } from './hooks/useTheme';
import { useScrollSpy } from './hooks/useScrollSpy';
import { useScrollReveal } from './hooks/useScrollReveal';

import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Experience from './sections/Experience';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import Education from './sections/Education';
import Certificates from './sections/Certificates';
import Achievements from './sections/Achievements';
import Research from './sections/Research';
import Contact from './sections/Contact';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

const sectionIds = [
  'home',
  'about',
  'experience',
  'projects',
  'skills',
  'education',
  'certificates',
  'achievements',
  'research',
  'contact',
];

export const PublicPortfolio = () => {
  const { theme, toggleTheme } = useTheme();
  const activeSection = useScrollSpy(sectionIds);
  useScrollReveal();

  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} activeSection={activeSection} />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Certificates />
        <Achievements />
        <Research />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default PublicPortfolio;
