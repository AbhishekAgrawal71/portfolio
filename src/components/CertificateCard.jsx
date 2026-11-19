import React from 'react';
import { Award, ExternalLink, FileText } from 'lucide-react';
import './CertificateCard.css';

const CertificateCard = ({ certificate }) => {
  const {
    id,
    name,
    title,
    organization,
    issuer,
    date,
    issueDate,
    credentialUrl,
    credential,
    image,
    pdf,
    description,
  } = certificate || {};

  const certName = name || title;
  const certOrg = organization || issuer;
  const certDate = date || issueDate;
  const certUrl = credentialUrl || credential;

  return (
    <div className="certificate-card animate-on-scroll">
      {image ? (
        <div className="certificate-card__image">
          <img src={image} alt={certName} loading="lazy" />
        </div>
      ) : (
        <div className="certificate-card__image certificate-card__image--placeholder">
          <Award size={40} />
        </div>
      )}

      <div className="certificate-card__content">
        <h3 className="certificate-card__name">{certName}</h3>
        {certOrg && (
          <p className="certificate-card__org">{certOrg}</p>
        )}
        {certDate && (
          <p className="certificate-card__date">{certDate}</p>
        )}
        {description && (
          <p className="certificate-card__description">{description}</p>
        )}
        
        <div className="certificate-card__actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {certUrl && certUrl.trim() !== '' && (
            <a
              href={certUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="certificate-card__link"
            >
              <ExternalLink size={14} />
              Verify Credential
            </a>
          )}
          {pdf && pdf.trim() !== '' && (
            <a
              href={pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="certificate-card__link"
              style={{ backgroundColor: 'var(--color-bg-secondary, #1a1a24)' }}
            >
              <FileText size={14} />
              View PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
