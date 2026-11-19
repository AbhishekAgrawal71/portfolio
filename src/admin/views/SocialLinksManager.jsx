import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Globe,
  Check
} from 'lucide-react';
import {
  getAdminSocialLinks,
  updateAdminSocialLink,
  createAdminSocialLink,
  deleteAdminSocialLink
} from '../../services/portfolioService';
import ConfirmModal from '../components/ConfirmModal';
import { usePortfolioData } from '../../context/PortfolioContext';

export const SocialLinksManager = ({ showToast }) => {
  const { refreshData } = usePortfolioData();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  // New link state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const data = await getAdminSocialLinks();
      setLinks(data || []);
    } catch (err) {
      console.warn('Could not load social links from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const handleUrlChange = (id, newUrl) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, url: newUrl } : l));
  };

  const handleToggleEnabled = async (link) => {
    try {
      const updated = !link.is_enabled;
      setLinks(prev => prev.map(l => l.id === link.id ? { ...l, is_enabled: updated } : l));
      await updateAdminSocialLink(link.id, { is_enabled: updated });
      await refreshData();
      showToast?.('success', `${link.label} is now ${updated ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      showToast?.('error', err.message || 'Failed to toggle status.');
      await loadLinks();
    }
  };

  const handleSaveLink = async (link) => {
    try {
      setSavingId(link.id);
      await updateAdminSocialLink(link.id, {
        label: link.label,
        url: link.url,
        is_enabled: link.is_enabled,
      });
      await refreshData();
      showToast?.('success', `Saved ${link.label}!`);
    } catch (err) {
      showToast?.('error', err.message || 'Failed to save link.');
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateCustomLink = async (e) => {
    e.preventDefault();
    if (!newLabel.trim() || !newUrl.trim()) {
      showToast?.('error', 'Label and URL are required.');
      return;
    }

    try {
      await createAdminSocialLink({
        platform: (newPlatform || newLabel).toLowerCase().replace(/\s+/g, '_'),
        label: newLabel,
        url: newUrl,
        is_enabled: true,
        sort_order: links.length,
      });

      setNewLabel('');
      setNewPlatform('');
      setNewUrl('');
      setShowAddForm(false);
      await loadLinks();
      await refreshData();
      showToast?.('success', 'Custom link added!');
    } catch (err) {
      showToast?.('error', err.message || 'Failed to add custom link.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAdminSocialLink(deleteTarget.id);
      showToast?.('success', `Deleted link "${deleteTarget.label}".`);
      setDeleteTarget(null);
      await loadLinks();
      await refreshData();
    } catch (err) {
      showToast?.('error', err.message || 'Failed to delete link.');
    }
  };

  return (
    <div className="admin-social-links-manager">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Social & Profiles</h1>
          <p className="admin-view-subtitle">Manage URLs for GitHub, LinkedIn, InsiderOne, LeetCode, and custom links</p>
        </div>
        <div className="admin-view-actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={16} /> Add Custom Link
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="admin-card" style={{ borderColor: 'var(--color-primary)' }}>
          <h3 className="admin-card-title" style={{ marginBottom: '1rem' }}>Add Custom Link</h3>
          <form onSubmit={handleCreateCustomLink}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Label *</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Codeforces, Kaggle, Devpost"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>URL *</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn--primary">
                Save Link
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 0.5rem', color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading social links...</p>
        </div>
      ) : (
        <div className="admin-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {links.map((link) => (
              <div
                key={link.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr auto auto',
                  gap: '1rem',
                  alignItems: 'center',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem' }}>
                    {link.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {link.platform}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleUrlChange(link.id, e.target.value)}
                    placeholder={`Enter ${link.label} URL...`}
                    style={{ width: '100%', fontSize: '0.85rem', padding: '0.55rem 0.75rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label className="admin-switch-label">
                    <input
                      type="checkbox"
                      checked={link.is_enabled}
                      onChange={() => handleToggleEnabled(link)}
                    />
                    <span style={{ fontSize: '0.8rem', color: link.is_enabled ? '#10b981' : 'var(--color-text-muted)' }}>
                      {link.is_enabled ? 'Visible' : 'Hidden'}
                    </span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--icon-only"
                    onClick={() => handleSaveLink(link)}
                    disabled={savingId === link.id}
                    title="Save changes"
                  >
                    {savingId === link.id ? <RefreshCw size={13} className="spin-icon" /> : <Save size={13} />}
                  </button>

                  {!['github', 'email', 'insiderOne'].includes(link.platform) && (
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger admin-btn--icon-only"
                      onClick={() => setDeleteTarget(link)}
                      title="Delete custom link"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Social Link"
        message={`Are you sure you want to delete "${deleteTarget?.label}"?`}
        confirmText="Yes, Delete Link"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default SocialLinksManager;
