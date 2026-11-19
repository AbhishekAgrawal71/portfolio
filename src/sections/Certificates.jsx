import certificates from '../data/certificates';
import SectionTitle from '../components/SectionTitle';
import CertificateCard from '../components/CertificateCard';
import './Certificates.css';

const Certificates = () => {
  // Don't render if certificates array is empty
  if (!certificates || certificates.length === 0) return null;

  return (
    <section id="certificates" className="certificates-section">
      <div className="certificates-container">
        <SectionTitle title="Certificates" />

        <div className="certificates-grid animate-on-scroll">
          {certificates.map((cert, index) => (
            <CertificateCard key={cert.id || index} certificate={cert} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certificates;
