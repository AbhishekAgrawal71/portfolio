import React, { useState } from 'react';
import { Send, Mail } from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioContext';
import './ContactForm.css';

const ContactForm = () => {
  const { personal } = usePortfolioData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const to = personal?.email || 'abhi713111@gmail.com';
    const subject = encodeURIComponent(formData.subject);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <form className="contact-form animate-on-scroll" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__group">
        <label className="contact-form__label" htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          className={`contact-form__input ${errors.name ? 'contact-form__input--error' : ''}`}
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span className="contact-form__error">{errors.name}</span>}
      </div>

      <div className="contact-form__group">
        <label className="contact-form__label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className={`contact-form__input ${errors.email ? 'contact-form__input--error' : ''}`}
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="contact-form__error">{errors.email}</span>}
      </div>

      <div className="contact-form__group">
        <label className="contact-form__label" htmlFor="subject">Subject</label>
        <input
          id="subject"
          name="subject"
          type="text"
          className={`contact-form__input ${errors.subject ? 'contact-form__input--error' : ''}`}
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
        />
        {errors.subject && <span className="contact-form__error">{errors.subject}</span>}
      </div>

      <div className="contact-form__group">
        <label className="contact-form__label" htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          className={`contact-form__input contact-form__textarea ${errors.message ? 'contact-form__input--error' : ''}`}
          placeholder="Your message..."
          rows={5}
          value={formData.message}
          onChange={handleChange}
        />
        {errors.message && <span className="contact-form__error">{errors.message}</span>}
      </div>

      <button type="submit" className="contact-form__submit">
        <Send size={18} />
        Send Message
      </button>

      <p className="contact-form__note">
        <Mail size={14} />
        This will open your default email client with the message pre-filled.
      </p>
    </form>
  );
};

export default ContactForm;
