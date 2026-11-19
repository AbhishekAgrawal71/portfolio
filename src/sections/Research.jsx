import React from 'react';
import { ExternalLink, BookOpen, Code2 } from 'lucide-react';
import { Github } from '../components/Icons';
import publications from '../data/publications';
import SectionTitle from '../components/SectionTitle';
import './Research.css';

const Research = () => {
  // Don't render if no publications
  if (!publications || publications.length === 0) return null;

  return (
    <section id="research" className="research-section">
      <div className="research-container">
        <SectionTitle title="Research & Publications" subtitle="Academic research and publications" />

        <div className="research-list animate-on-scroll">
          {publications.map((pub, index) => {
            const paperLink = pub.paperUrl || pub.paper || pub.url || pub.link;
            const codeLink = pub.codeUrl || pub.code;
            const venue = pub.venue || pub.journal;
            const authorsList = Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors;

            return (
              <div className="research-card" key={pub.id || index}>
                <div className="research-card-icon">
                  <BookOpen size={22} />
                </div>
                <div className="research-card-content">
                  <h3 className="research-title">{pub.title}</h3>
                  {authorsList && (
                    <p className="research-authors" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      {authorsList}
                    </p>
                  )}
                  {venue && (
                    <p className="research-journal">
                      <em>{venue}</em> {pub.year && `• ${pub.year}`}
                    </p>
                  )}
                  {pub.description && (
                    <p className="research-description">{pub.description}</p>
                  )}
                  <div className="research-links" style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {paperLink && paperLink.trim() !== '' && (
                      <a
                        href={paperLink}
                        className="research-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read Paper <ExternalLink size={14} />
                      </a>
                    )}
                    {codeLink && codeLink.trim() !== '' && (
                      <a
                        href={codeLink}
                        className="research-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github size={14} /> View Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Research;
