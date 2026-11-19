import React from 'react';
import { ExternalLink, Mail } from 'lucide-react';
import { Github, Linkedin, Twitter } from './Icons';
import { usePortfolioData } from '../context/PortfolioContext';
import './Footer.css';

const Footer = () => {
  const { personal, socialLinks = [] } = usePortfolioData();
  const year = new Date().getFullYear();
  const name = personal?.name || 'Abhishek Agrawal';
  const email = personal?.email;

  // Icon mapper
  const getIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'github': return Github;
      case 'linkedin': return Linkedin;
      case 'twitter': return Twitter;
      default: return ExternalLink;
    }
  };

  // Build active list combining database social links or fallback
  const activeSocials = (socialLinks && socialLinks.length > 0)
    ? socialLinks.filter(s => s.is_enabled && s.url && s.url.trim() !== '' && !s.url.startsWith('mailto:')).map(s => ({
        key: s.id || s.platform,
        url: s.url,
        icon: getIcon(s.platform),
        label: s.label || s.platform,
      }))
    : [
        { key: 'github', url: personal?.github, icon: Github, label: 'GitHub' },
        { key: 'linkedin', url: personal?.linkedin, icon: Linkedin, label: 'LinkedIn' },
        { key: 'twitter', url: personal?.twitter, icon: Twitter, label: 'Twitter' },
        { key: 'insiderOne', url: personal?.insiderOne, icon: ExternalLink, label: 'InsiderOne' },
      ].filter(l => l.url && l.url.trim() !== '');

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <span className="footer__name">{name}</span>
        </div>

        {(activeSocials.length > 0 || (email && email.trim() !== '')) && (
          <div className="footer__socials">
            {email && email.trim() !== '' && (
              <a
                href={`mailto:${email}`}
                className="footer__social-link"
                aria-label="Email"
                title="Email"
              >
                <Mail size={18} />
              </a>
            )}
            {activeSocials.map(({ key, url, icon: Icon, label }) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label={label}
                title={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        )}

        <div className="footer__copyright">
          <p>© {year} {name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
