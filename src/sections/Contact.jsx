import { Mail, User } from 'lucide-react';
import { Github } from '../components/Icons';
import personal from '../data/personal';
import SectionTitle from '../components/SectionTitle';
import ContactForm from '../components/ContactForm';
import './Contact.css';

const Contact = () => {
  const contactLinks = [
    {
      icon: <Mail size={22} />,
      label: 'Email',
      value: personal.email,
      href: personal.email ? `mailto:${personal.email}` : null,
    },
    {
      icon: <Github size={22} />,
      label: 'GitHub',
      value: personal.github ? 'AbhishekAgrawal71' : null,
      href: personal.github,
    },
    {
      icon: <User size={22} />,
      label: 'InsiderOne',
      value: personal.insiderOne ? 'View Profile' : null,
      href: personal.insiderOne,
    },
  ].filter((link) => link.value && link.href);

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <SectionTitle title="Get In Touch" />

        <div className="contact-content animate-on-scroll">
          <div className="contact-info">
            <p className="contact-description">
              Have a question or want to work together? Feel free to reach out!
            </p>

            <div className="contact-links">
              {contactLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="contact-link-card"
                  target={link.label !== 'Email' ? '_blank' : undefined}
                  rel={link.label !== 'Email' ? 'noopener noreferrer' : undefined}
                >
                  <div className="contact-link-icon">{link.icon}</div>
                  <div className="contact-link-info">
                    <span className="contact-link-label">{link.label}</span>
                    <span className="contact-link-value">{link.value}</span>
                  </div>
                </a>
              ))}
            </div>

            <p className="contact-form-note">
              * The contact form will open your default email client.
            </p>
          </div>

          <div className="contact-form-wrapper">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
