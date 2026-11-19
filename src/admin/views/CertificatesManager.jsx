import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Award,
  ExternalLink,
  FileText,
  Upload,
  X,
  Save,
  RefreshCw,
  Calendar
} from 'lucide-react';
import {
  getAdminCertificates,
  createAdminCertificate,
  updateAdminCertificate,
  deleteAdminCertificate
} from '../../services/portfolioService';
import { uploadFile, BUCKETS } from '../../services/storageService';
import ConfirmModal from '../components/ConfirmModal';
import { usePortfolioData } from '../../context/PortfolioContext';

export const CertificatesManager = ({ showToast }) => {
  const { refreshData } = usePortfolioData();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const defaultForm = {
    title: '',
    issuer: '',
    issue_date: '2025',
    credential_url: '',
    description: '',
    image_url: '',
    pdf_url: '',
    sort_order: 0,
    is_visible: true,
  };
  const [formData, setFormData] = useState(defaultForm);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await getAdminCertificates();
      setCertificates(data || []);
    } catch (err) {
      console.warn('Could not load certificates from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleOpenAdd = () => {
    setEditingCert(null);
    setFormData({
      ...defaultForm,
      sort_order: certificates.length,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cert) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title || '',
      issuer: cert.issuer || '',
      issue_date: cert.issue_date || '',
      credential_url: cert.credential_url || '',
      description: cert.description || '',
      image_url: cert.image_url || '',
      pdf_url: cert.pdf_url || '',
      sort_order: cert.sort_order ?? 0,
      is_visible: cert.is_visible !== false,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const publicUrl = await uploadFile(BUCKETS.CERTIFICATES, file);

      if (isPdf) {
        setFormData(prev => ({ ...prev, pdf_url: publicUrl }));
        showToast?.('success', 'Certificate PDF uploaded!');
      } else {
        setFormData(prev => ({ ...prev, image_url: publicUrl }));
        showToast?.('success', 'Certificate image uploaded!');
      }
    } catch (err) {
      console.error('File upload error:', err);
      showToast?.('error', err.message || 'Failed to upload certificate file.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.issuer.trim()) {
      showToast?.('error', 'Title and Issuer are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title,
        issuer: formData.issuer,
        issue_date: formData.issue_date,
        credential_url: formData.credential_url,
        description: formData.description,
        image_url: formData.image_url,
        pdf_url: formData.pdf_url,
        sort_order: formData.sort_order,
        is_visible: formData.is_visible,
      };

      if (editingCert) {
        await updateAdminCertificate(editingCert.id, payload);
        showToast?.('success', 'Certificate updated!');
      } else {
        await createAdminCertificate(payload);
        showToast?.('success', 'New certificate added!');
      }

      setIsModalOpen(false);
      await loadCertificates();
      await refreshData();
    } catch (err) {
      console.error('Save certificate error:', err);
      showToast?.('error', err.message || 'Failed to save certificate.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAdminCertificate(deleteTarget.id);
      showToast?.('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      await loadCertificates();
      await refreshData();
    } catch (err) {
      showToast?.('error', err.message || 'Failed to delete certificate.');
    }
  };

  return (
    <div className="admin-certificates-manager">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Certificates & Credentials</h1>
          <p className="admin-view-subtitle">Manage online courses, technical certifications, and verification badges</p>
        </div>
        <div className="admin-view-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Certificate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 0.5rem', color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="admin-card admin-empty-state">
          <Award size={40} />
          <h3>No certificates in database</h3>
          <p>Add credentials from Coursera, AWS, Google, or NPTEL. The public Certificates section will automatically appear as soon as one is added.</p>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Add Certificate
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {certificates.map((cert) => (
            <div key={cert.id} className="admin-card" style={{ marginBottom: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '0.5rem',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Award size={18} />
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--icon-only"
                    onClick={() => handleOpenEdit(cert)}
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger admin-btn--icon-only"
                    onClick={() => setDeleteTarget(cert)}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 0.25rem' }}>
                {cert.title}
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-primary)', margin: 0 }}>
                {cert.issuer}
              </p>
              {cert.issue_date && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={12} /> {cert.issue_date}
                </div>
              )}
              {cert.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', flex: 1 }}>
                  {cert.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {cert.credential_url && (
                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--secondary admin-btn--sm">
                    <ExternalLink size={12} /> Verify Link
                  </a>
                )}
                {cert.pdf_url && (
                  <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--secondary admin-btn--sm">
                    <FileText size={12} /> View PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Certificate Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCert ? 'Edit Certificate' : 'Add Certificate'}
              </h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Certificate Name *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Deep Learning Specialization"
                    required
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Issuing Organization *</label>
                    <input
                      type="text"
                      value={formData.issuer}
                      onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                      placeholder="e.g. Coursera / DeepLearning.AI"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Issue Date</label>
                    <input
                      type="text"
                      value={formData.issue_date}
                      onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                      placeholder="e.g. March 2025"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Verification / Credential URL</label>
                  <input
                    type="url"
                    value={formData.credential_url}
                    onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                    placeholder="https://coursera.org/verify/XXXX"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Upload Certificate (Image or PDF)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={formData.pdf_url || formData.image_url}
                      onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                      placeholder="File URL will appear here upon upload..."
                      style={{ flex: 1 }}
                    />
                    <label className="admin-btn admin-btn--secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {uploadingFile ? <RefreshCw size={14} className="spin-icon" /> : <Upload size={14} />}
                      {uploadingFile ? 'Uploading...' : 'Upload File'}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Description (Coursework topics covered)</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Topics and practical skills learned..."
                  />
                </div>

                <label className="admin-switch-label" style={{ marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                  />
                  <span>Show certificate on public site</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={saving}
                >
                  {saving ? <RefreshCw size={14} className="spin-icon" /> : <Save size={14} />}
                  {saving ? 'Saving...' : editingCert ? 'Save Changes' : 'Create Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Certificate"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmText="Yes, Delete Certificate"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default CertificatesManager;
