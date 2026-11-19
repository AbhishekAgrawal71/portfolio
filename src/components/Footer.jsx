import React from 'react';
import { ExternalLink, Mail } from 'lucide-react';
import { Github, Linkedin, Twitter } from './Icons';
import { personalInfo } from '../data/personal';
import './Footer.css';

const socialLinks = [
  { key: 'github', url: personalInfo?.github, icon: Github, label: 'GitHub' },
  { key: 'linkedin', url: personalInfo?.linkedin, icon: Linkedin, label: 'LinkedIn' },
  { key: 'twitter', url: personalInfo?.twitter, icon: Twitter, label: 'Twitter' },
  { key: 'insiderOne', url: personalInfo?.insiderOne, icon: ExternalLink, label: 'InsiderOne' },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const name = personalInfo?.name || 'Abhishek Agrawal';
  const email = personalInfo?.email;

  // Filter out social links with no URL
  const activeSocials = socialLinks.filter(
    (link) => link.url && link.url.trim() !== ''
  );

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

        <p className="footer__copyright">
          &copy; {year} {name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
