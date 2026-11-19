import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Award,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  X,
  Save,
  RefreshCw,
  Calendar
} from 'lucide-react';
import {
  getAdminAchievements,
  createAdminAchievement,
  updateAdminAchievement,
  deleteAdminAchievement
} from '../../services/portfolioService';
import ConfirmModal from '../components/ConfirmModal';
import { usePortfolioData } from '../../context/PortfolioContext';

export const AchievementsManager = ({ showToast }) => {
  const { refreshData } = usePortfolioData();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAch, setEditingAch] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const defaultForm = {
    title: '',
    organization: '',
    year: '2025',
    description: '',
    sort_order: 0,
    is_visible: true,
  };
  const [formData, setFormData] = useState(defaultForm);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await getAdminAchievements();
      setAchievements(data || []);
    } catch (err) {
      console.warn('Could not load achievements from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const handleOpenAdd = () => {
    setEditingAch(null);
    setFormData({
      ...defaultForm,
      sort_order: achievements.length,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ach) => {
    setEditingAch(ach);
    setFormData({
      title: ach.title || '',
      organization: ach.organization || '',
      year: ach.year || '',
      description: ach.description || '',
      sort_order: ach.sort_order ?? 0,
      is_visible: ach.is_visible !== false,
    });
    setIsModalOpen(true);
  };

  const handleToggleVisible = async (ach) => {
    try {
      await updateAdminAchievement(ach.id, { is_visible: !ach.is_visible });
      setAchievements(prev => prev.map(a => a.id === ach.id ? { ...a, is_visible: !a.is_visible } : a));
      await refreshData();
      showToast?.('success', 'Updated visibility status.');
    } catch (err) {
      showToast?.('error', err.message || 'Failed to update visibility.');
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= achievements.length) return;

    const list = [...achievements];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    try {
      setAchievements(list);
      await Promise.all(
        list.map((item, idx) => updateAdminAchievement(item.id, { sort_order: idx }))
      );
      await refreshData();
    } catch (err) {
      showToast?.('error', 'Failed to reorder achievements.');
      await loadAchievements();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.organization.trim()) {
      showToast?.('error', 'Title and Organization are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title,
        organization: formData.organization,
        year: formData.year,
        description: formData.description,
        sort_order: formData.sort_order,
        is_visible: formData.is_visible,
      };

      if (editingAch) {
        await updateAdminAchievement(editingAch.id, payload);
        showToast?.('success', 'Achievement updated!');
      } else {
        await createAdminAchievement(payload);
        showToast?.('success', 'New achievement added!');
      }

      setIsModalOpen(false);
      await loadAchievements();
      await refreshData();
    } catch (err) {
      console.error('Save achievement error:', err);
      showToast?.('error', err.message || 'Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAdminAchievement(deleteTarget.id);
      showToast?.('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      await loadAchievements();
      await refreshData();
    } catch (err) {
      showToast?.('error', err.message || 'Failed to delete achievement.');
    }
  };

  return (
    <div className="admin-achievements-manager">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Achievements & Leadership</h1>
          <p className="admin-view-subtitle">Manage campus leadership roles, competition honors, and committees</p>
        </div>
        <div className="admin-view-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Achievement
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 0.5rem', color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading achievements...</p>
        </div>
      ) : achievements.length === 0 ? (
        <div className="admin-card admin-empty-state">
          <Award size={40} />
          <h3>No achievements in database</h3>
          <p>Add committee roles, awards, or student chapter responsibilities.</p>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Add Achievement
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {achievements.map((ach, idx) => (
            <div key={ach.id} className="admin-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '0.5rem',
                    background: 'rgba(234, 179, 8, 0.15)',
                    color: '#eab308',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                      {ach.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-primary)', margin: '0.2rem 0 0' }}>
                      {ach.organization} {ach.year && `• ${ach.year}`}
                    </p>
                    {ach.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
                        {ach.description}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.2rem', marginRight: '0.5rem' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn--secondary admin-btn--icon-only"
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, -1)}
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--secondary admin-btn--icon-only"
                      disabled={idx === achievements.length - 1}
                      onClick={() => handleMoveOrder(idx, 1)}
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--icon-only"
                    onClick={() => handleToggleVisible(ach)}
                    title={ach.is_visible ? 'Hide' : 'Show'}
                    style={{ color: ach.is_visible ? '#10b981' : 'var(--color-text-muted)' }}
                  >
                    {ach.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>

                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--icon-only"
                    onClick={() => handleOpenEdit(ach)}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    type="button"
                    className="admin-btn admin-btn--danger admin-btn--icon-only"
                    onClick={() => setDeleteTarget(ach)}
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

      {/* Add / Edit Achievement Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingAch ? 'Edit Achievement' : 'Add Achievement'}
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
                  <label>Title / Role *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Publicity Committee Member"
                    required
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Organization / Event *</label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. FIPI Student Chapter, UPES"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Year / Date</label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g. 2025"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Description of Responsibilities & Impact</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Managed publicity campaigns and social-media content..."
                  />
                </div>

                <label className="admin-switch-label" style={{ marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                  />
                  <span>Show on public site</span>
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
                  {saving ? 'Saving...' : editingAch ? 'Save Changes' : 'Create Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Achievement"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmText="Yes, Delete Achievement"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AchievementsManager;
