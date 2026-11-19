import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  ExternalLink,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  getAdminResumes,
  createAdminResume,
  setAdminActiveResume,
  deleteAdminResume
} from '../../services/portfolioService';
import { uploadFile, deleteFile, BUCKETS } from '../../services/storageService';
import ConfirmModal from '../components/ConfirmModal';
import { usePortfolioData } from '../../context/PortfolioContext';

export const ResumeManager = ({ showToast }) => {
  const { personal, refreshData } = usePortfolioData();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await getAdminResumes();
      setResumes(data || []);
    } catch (err) {
      console.warn('Could not load resumes from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const activeResume = resumes.find(r => r.is_active) || {
    id: 'default',
    file_name: 'Abhishek_Agrawal_Resume.pdf',
    file_url: personal?.resumePath || '/resume/Abhishek_Agrawal_Resume.pdf',
    is_active: true,
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast?.('error', 'Only PDF files are supported for resumes.');
      return;
    }

    let publicUrl = null;
    try {
      setUploading(true);
      publicUrl = await uploadFile(BUCKETS.RESUMES, file);

      await createAdminResume({
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        is_active: true,
      });

      showToast?.('success', `Resume "${file.name}" uploaded and set as active!`);
      await loadResumes();
      await refreshData();
    } catch (err) {
      console.error('Resume upload error:', err);
      if (publicUrl) {
        await deleteFile(BUCKETS.RESUMES, publicUrl);
      }
      showToast?.('error', err.message || 'Failed to upload resume PDF.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSetActive = async (resume) => {
    try {
      await setAdminActiveResume(resume.id);
      showToast?.('success', `Set "${resume.file_name}" as active resume!`);
      await loadResumes();
      await refreshData();
    } catch (err) {
      showToast?.('error', err.message || 'Failed to activate resume.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAdminResume(deleteTarget.id);
      if (deleteTarget.file_url && deleteTarget.file_url.includes(BUCKETS.RESUMES)) {
        await deleteFile(BUCKETS.RESUMES, deleteTarget.file_url);
      }
      showToast?.('success', `Deleted resume "${deleteTarget.file_name}".`);
      setDeleteTarget(null);
      await loadResumes();
      await refreshData();
    } catch (err) {
      showToast?.('error', err.message || 'Failed to delete resume.');
    }
  };

  return (
    <div className="admin-resume-manager">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Resume Manager</h1>
          <p className="admin-view-subtitle">Upload, replace, preview, and manage your official CV / Resume PDF</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Active Resume Details & Upload Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Card */}
          <div className="admin-card" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="admin-badge admin-badge--success">
                <CheckCircle2 size={13} /> Active Public Resume
              </span>
              {activeResume.created_at && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} /> Uploaded on {new Date(activeResume.created_at).toLocaleDateString()}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '0.75rem',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={26} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {activeResume.file_name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0' }}>
                  Downloaded when recruiters click "Download Resume" across the site
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href={activeResume.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn--primary admin-btn--sm"
              >
                <ExternalLink size={14} /> Preview PDF
              </a>
              <a
                href={activeResume.file_url}
                download={activeResume.file_name}
                className="admin-btn admin-btn--secondary admin-btn--sm"
              >
                <Download size={14} /> Download PDF
              </a>
            </div>
          </div>

          {/* Upload New Resume Card */}
          <div className="admin-card" style={{ borderStyle: 'dashed', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Upload size={24} />
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
              Upload New Resume PDF
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Uploading a new PDF immediately stores it securely in Supabase Storage and updates the live website download link.
            </p>

            <label className="admin-btn admin-btn--primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              {uploading ? <RefreshCw size={15} className="spin-icon" /> : <Upload size={15} />}
              {uploading ? 'Uploading to Storage...' : 'Select PDF File'}
              <input
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Right Column: Version History / Past Resumes */}
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ marginBottom: '1rem' }}>Resume History</h3>

          {resumes.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Using initial local resume PDF. Upload your first PDF to begin tracking versions!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {resumes.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    background: r.is_active ? 'rgba(59, 130, 246, 0.08)' : 'var(--color-bg, #0a0a0f)',
                    border: `1px solid ${r.is_active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ overflow: 'hidden', paddingRight: '0.5rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {r.file_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Initial'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {!r.is_active && (
                        <button
                          type="button"
                          className="admin-btn admin-btn--secondary admin-btn--sm"
                          onClick={() => handleSetActive(r)}
                          title="Set as active"
                        >
                          Activate
                        </button>
                      )}
                      {!r.is_active && (
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger admin-btn--icon-only"
                          onClick={() => setDeleteTarget(r)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Resume Version"
        message={`Are you sure you want to delete "${deleteTarget?.file_name}"?`}
        confirmText="Yes, Delete Version"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ResumeManager;
