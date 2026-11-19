import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  ExternalLink,
  Code2,
  X,
  Save,
  RefreshCw,
  Calendar
} from 'lucide-react';
import {
  getAdminPublications,
  createAdminPublication,
  updateAdminPublication,
  deleteAdminPublication
} from '../../services/portfolioService';
import ConfirmModal from '../components/ConfirmModal';
import { usePortfolioData } from '../../context/PortfolioContext';

export const PublicationsManager = ({ showToast }) => {
  const { refreshData } = usePortfolioData();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPub, setEditingPub] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const defaultForm = {
    title: '',
    description: '',
    venue: '',
    year: '2026',
    paper_url: '',
    code_url: '',
    topics: '',
    sort_order: 0,
    is_visible: true,
  };
  const [formData, setFormData] = useState(defaultForm);

  const loadPublications = async () => {
    try {
      setLoading(true);
      const data = await getAdminPublications();
      setPublications(data || []);
    } catch (err) {
      console.warn('Could not load publications from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, []);

  const handleOpenAdd = () => {
    setEditingPub(null);
    setFormData({
      ...defaultForm,
      sort_order: publications.length,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pub) => {
    setEditingPub(pub);
    const topicsStr = Array.isArray(pub.topics)
      ? pub.topics.join(', ')
      : (pub.topics ? JSON.parse(pub.topics).join(', ') : '');

    setFormData({
      title: pub.title || '',
      description: pub.description || '',
      venue: pub.venue || '',
      year: pub.year || '',
      paper_url: pub.paper_url || '',
      code_url: pub.code_url || '',
      topics: topicsStr,
      sort_order: pub.sort_order ?? 0,
      is_visible: pub.is_visible !== false,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast?.('error', 'Publication title is required.');
      return;
    }

    try {
      setSaving(true);
      const topicsArray = formData.topics
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        description: formData.description,
        venue: formData.venue,
        year: formData.year,
        paper_url: formData.paper_url,
        code_url: formData.code_url,
        topics: topicsArray,
        sort_order: formData.sort_order,
        is_visible: formData.is_visible,
      };

      if (editingPub) {
        await updateAdminPublication(editingPub.id, payload);
        showToast?.('success', 'Publication updated!');
      } else {
        await createAdminPublication(payload);
        showToast?.('success', 'New publication added!');
      }

      setIsModalOpen(false);
      await loadPublications();
      await refreshData();
    } catch (err) {
      console.error('Save publication error:', err);
      showToast?.('error', err.message || 'Failed to save publication.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAdminPublication(deleteTarget.id);
      showToast?.('success', `Deleted publication "${deleteTarget.title}".`);
      setDeleteTarget(null);
      await loadPublications();
      await refreshData();
    } catch (err) {
      showToast?.('error', err.message || 'Failed to delete publication.');
    }
  };

  return (
    <div className="admin-publications-manager">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Research & Publications</h1>
          <p className="admin-view-subtitle">Showcase academic papers, conference proceedings, and preprints</p>
        </div>
        <div className="admin-view-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Publication
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 0.5rem', color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading publications...</p>
        </div>
      ) : publications.length === 0 ? (
        <div className="admin-card admin-empty-state">
          <BookOpen size={40} />
          <h3>No research papers yet</h3>
          <p>When you publish research papers or conference articles, add them here. The Research section will automatically appear on the public portfolio.</p>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Add Publication
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {publications.map((pub) => (
            <div key={pub.id} className="admin-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '0.5rem',
                    background: 'rgba(236, 72, 153, 0.15)',
                    color: '#ec4899',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                      {pub.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)', margin: '0.2rem 0 0' }}>
                      <em>{pub.venue || 'Preprint'}</em> {pub.year && `• ${pub.year}`}
                    </p>
                    {pub.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
                        {pub.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {pub.paper_url && (
                        <a href={pub.paper_url} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--secondary admin-btn--sm">
                          <ExternalLink size={12} /> Paper Link
                        </a>
                      )}
                      {pub.code_url && (
                        <a href={pub.code_url} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--secondary admin-btn--sm">
                          <Code2 size={12} /> Code Repository
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--icon-only"
                    onClick={() => handleOpenEdit(pub)}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger admin-btn--icon-only"
                    onClick={() => setDeleteTarget(pub)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Publication Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingPub ? 'Edit Publication' : 'Add Publication'}
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
                  <label>Paper Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Predictive Modeling for Undergraduate Placement..."
                    required
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Conference / Journal / Venue</label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      placeholder="e.g. IEEE Conference on Computing & AI"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Publication Year</label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g. 2026"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Paper URL (PDF / ArXiv)</label>
                    <input
                      type="url"
                      value={formData.paper_url}
                      onChange={(e) => setFormData({ ...formData, paper_url: e.target.value })}
                      placeholder="https://arxiv.org/abs/..."
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Code Repository URL</label>
                    <input
                      type="url"
                      value={formData.code_url}
                      onChange={(e) => setFormData({ ...formData, code_url: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Topics / Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={formData.topics}
                    onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                    placeholder="Machine Learning, Classification, Student Placement"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Abstract / Contribution Summary</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Summary of findings and contributions..."
                  />
                </div>

                <label className="admin-switch-label" style={{ marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                  />
                  <span>Show on public portfolio</span>
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
                  {saving ? 'Saving...' : editingPub ? 'Save Changes' : 'Create Publication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Publication"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmText="Yes, Delete Publication"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default PublicationsManager;
