import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Save,
  RefreshCw,
  Briefcase,
  Calendar,
  MapPin,
  Check
} from 'lucide-react';
import {
  getAdminExperience,
  createAdminExperience,
  updateAdminExperience,
  deleteAdminExperience
} from '../../services/portfolioService';
import ConfirmModal from '../components/ConfirmModal';
import { usePortfolioData } from '../../context/PortfolioContext';

export const ExperienceManager = ({ showToast }) => {
  const { refreshData } = usePortfolioData();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const defaultForm = {
    role: '',
    company: '',
    location: 'Remote',
    start_date: 'June 2026',
    end_date: 'Present',
    is_present: true,
    description: '',
    responsibilities: [''],
    technologies: '',
    sort_order: 0,
    is_visible: true,
  };
  const [formData, setFormData] = useState(defaultForm);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const data = await getAdminExperience();
      setExperiences(data || []);
    } catch (err) {
      console.warn('Could not load experience from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const handleOpenAdd = () => {
    setEditingExp(null);
    setFormData({
      ...defaultForm,
      sort_order: experiences.length,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExp(exp);
    const resps = Array.isArray(exp.responsibilities)
      ? exp.responsibilities
      : (exp.responsibilities ? JSON.parse(exp.responsibilities) : ['']);

    const techs = Array.isArray(exp.technologies)
      ? exp.technologies.join(', ')
      : (exp.technologies ? JSON.parse(exp.technologies).join(', ') : '');

    setFormData({
      role: exp.role || '',
      company: exp.company || '',
      location: exp.location || 'Remote',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      is_present: !!exp.is_present,
      description: exp.description || '',
      responsibilities: resps.length > 0 ? resps : [''],
      technologies: techs,
      sort_order: exp.sort_order ?? 0,
      is_visible: exp.is_visible !== false,
    });
    setIsModalOpen(true);
  };

  const handleResponsibilityChange = (index, value) => {
    const updated = [...formData.responsibilities];
    updated[index] = value;
    setFormData({ ...formData, responsibilities: updated });
  };

  const addResponsibilityField = () => {
    setFormData({ ...formData, responsibilities: [...formData.responsibilities, ''] });
  };

  const removeResponsibilityField = (index) => {
    const updated = formData.responsibilities.filter((_, i) => i !== index);
    setFormData({ ...formData, responsibilities: updated.length > 0 ? updated : [''] });
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;

    const list = [...experiences];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    try {
      setExperiences(list);
      await Promise.all(
        list.map((item, idx) => updateAdminExperience(item.id, { sort_order: idx }))
      );
      await refreshData();
    } catch (err) {
      showToast?.('error', 'Failed to reorder experiences.');
      await loadExperiences();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role.trim() || !formData.company.trim()) {
      showToast?.('error', 'Role and Company are required.');
      return;
    }

    try {
      setSaving(true);
      const cleanResponsibilities = formData.responsibilities
        .map(r => r.trim())
        .filter(Boolean);

      const techArray = formData.technologies
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        role: formData.role,
        company: formData.company,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.is_present ? 'Present' : formData.end_date,
        is_present: formData.is_present,
        description: formData.description,
        responsibilities: cleanResponsibilities,
        technologies: techArray,
        sort_order: formData.sort_order,
        is_visible: formData.is_visible,
      };

      if (editingExp) {
        await updateAdminExperience(editingExp.id, payload);
        showToast?.('success', 'Experience updated successfully!');
      } else {
        await createAdminExperience(payload);
        showToast?.('success', 'New experience added successfully!');
      }

      setIsModalOpen(false);
      await loadExperiences();
      await refreshData();
    } catch (err) {
      console.error('Save experience error:', err);
      showToast?.('error', err.message || 'Failed to save experience.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAdminExperience(deleteTarget.id);
      showToast?.('success', `Deleted experience at "${deleteTarget.company}".`);
      setDeleteTarget(null);
      await loadExperiences();
      await refreshData();
    } catch (err) {
      showToast?.('error', err.message || 'Failed to delete experience.');
    }
  };

  return (
    <div className="admin-experience-manager">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Work Experience</h1>
          <p className="admin-view-subtitle">Manage internships, employment roles, and responsibilities</p>
        </div>
        <div className="admin-view-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Experience
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 0.5rem', color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading experience entries...</p>
        </div>
      ) : experiences.length === 0 ? (
        <div className="admin-card admin-empty-state">
          <Briefcase size={40} />
          <h3>No experience records found</h3>
          <p>Add your internships or full-time roles.</p>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Add Experience
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {experiences.map((exp, idx) => (
            <div key={exp.id} className="admin-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '0.5rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                      {exp.role} <span style={{ color: 'var(--color-primary)', fontWeight: 400 }}>@ {exp.company}</span>
                    </h3>
                    <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} /> {exp.start_date} - {exp.is_present ? 'Present' : exp.end_date}
                      </span>
                      {exp.location && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={13} /> {exp.location}
                        </span>
                      )}
                    </div>
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
                      disabled={idx === experiences.length - 1}
                      onClick={() => handleMoveOrder(idx, 1)}
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--icon-only"
                    onClick={() => handleOpenEdit(exp)}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger admin-btn--icon-only"
                    onClick={() => setDeleteTarget(exp)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Responsibilities Preview */}
              {Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0 && (
                <ul style={{ margin: '0.85rem 0 0 3.25rem', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {exp.responsibilities.map((r, rIdx) => (
                    <li key={rIdx}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Experience Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingExp ? 'Edit Experience' : 'Add Experience'}
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
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Role / Position Title *</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Web Development Intern"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Company / Organization *</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Weazy"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Remote or Dehradun, India"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Start Date *</label>
                    <input
                      type="text"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      placeholder="e.g. June 2026"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row" style={{ alignItems: 'center' }}>
                  <div className="admin-form-group">
                    <label>End Date</label>
                    <input
                      type="text"
                      value={formData.is_present ? 'Present' : formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      placeholder="e.g. August 2026"
                      disabled={formData.is_present}
                    />
                  </div>

                  <div className="admin-form-group" style={{ paddingTop: '1.25rem' }}>
                    <label className="admin-switch-label">
                      <input
                        type="checkbox"
                        checked={formData.is_present}
                        onChange={(e) => setFormData({ ...formData, is_present: e.target.checked })}
                      />
                      <span>I currently work here (Present)</span>
                    </label>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Short Role Summary</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief overview of what you worked on..."
                  />
                </div>

                {/* Responsibilities list */}
                <div className="admin-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ margin: 0 }}>Key Responsibilities & Bullet Points</label>
                    <button
                      type="button"
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                      onClick={addResponsibilityField}
                    >
                      <Plus size={13} /> Add Bullet
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {formData.responsibilities.map((bullet, bIdx) => (
                      <div key={bIdx} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => handleResponsibilityChange(bIdx, e.target.value)}
                          placeholder={`Responsibility #${bIdx + 1}`}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger admin-btn--icon-only"
                          onClick={() => removeResponsibilityField(bIdx)}
                          title="Remove bullet"
                          disabled={formData.responsibilities.length === 1 && !bullet}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Technologies Used (comma separated)</label>
                  <input
                    type="text"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    placeholder="HTML, CSS, JavaScript, Responsive Design"
                  />
                </div>
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
                  {saving ? 'Saving...' : editingExp ? 'Save Changes' : 'Create Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Experience"
        message={`Are you sure you want to delete your experience at "${deleteTarget?.company}"?`}
        confirmText="Yes, Delete Experience"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ExperienceManager;
