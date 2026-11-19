import { usePortfolioData } from '../context/PortfolioContext';
import SectionTitle from '../components/SectionTitle';
import CertificateCard from '../components/CertificateCard';
import './Certificates.css';

const Certificates = () => {
  const { certificates, settings } = usePortfolioData();
  const visibleCerts = (certificates || []).filter(c => c.isVisible !== false);

  // Don't render if certificates array is empty or hidden in settings
  if (settings?.show_certificates === 'false' || !visibleCerts || visibleCerts.length === 0) return null;

  return (
    <section id="certificates" className="certificates-section">
      <div className="certificates-container">
        <SectionTitle title="Certificates" />

        <div className="certificates-grid animate-on-scroll">
          {visibleCerts.map((cert, index) => (
            <CertificateCard key={cert.id || index} certificate={cert} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certificates;
