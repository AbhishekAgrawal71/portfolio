import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  Calendar,
  Award,
  MapPin,
  X,
  Save,
  RefreshCw
} from 'lucide-react';
import {
  getAdminEducation,
  createAdminEducation,
  updateAdminEducation,
  deleteAdminEducation
} from '../../services/portfolioService';
import ConfirmModal from '../components/ConfirmModal';
import { usePortfolioData } from '../../context/PortfolioContext';

export const EducationManager = ({ showToast }) => {
  const { refreshData } = usePortfolioData();
  const [educationList, setEducationList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const defaultForm = {
    institution: '',
    degree: '',
    specialization: 'Computer Science and Engineering',
    start_year: '2024',
    end_year: '2028',
    duration: '2024 - 2028',
    status: 'Third Year / 5th Semester',
    location: 'Dehradun, India',
    cgpa: '8.9 / 10',
    grade: '8.9 / 10 CGPA',
    description: '',
    sort_order: 0,
    is_visible: true,
  };
  const [formData, setFormData] = useState(defaultForm);

  const loadEducation = async () => {
    try {
      setLoading(true);
      const data = await getAdminEducation();
      setEducationList(data || []);
    } catch (err) {
      console.warn('Could not load education from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEducation();
  }, []);

  const handleOpenAdd = () => {
    setEditingEdu(null);
    setFormData({
      ...defaultForm,
      sort_order: educationList.length,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (edu) => {
    setEditingEdu(edu);
    setFormData({
      institution: edu.institution || '',
      degree: edu.degree || '',
      specialization: edu.specialization || '',
      start_year: edu.start_year || '',
      end_year: edu.end_year || '',
      duration: edu.duration || `${edu.start_year || ''} - ${edu.end_year || ''}`,
      status: edu.status || '',
      location: edu.location || '',
      cgpa: edu.cgpa || '',
      grade: edu.grade || '',
      description: edu.description || '',
      sort_order: edu.sort_order ?? 0,
      is_visible: edu.is_visible !== false,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.institution.trim() || !formData.degree.trim()) {
      showToast?.('error', 'Institution and Degree are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        institution: formData.institution,
        degree: formData.degree,
        specialization: formData.specialization,
        start_year: formData.start_year,
        end_year: formData.end_year,
        duration: formData.duration || `${formData.start_year} - ${formData.end_year}`,
        status: formData.status,
        location: formData.location,
        cgpa: formData.cgpa,
        grade: formData.grade || formData.cgpa,
        description: formData.description,
        sort_order: formData.sort_order,
        is_visible: formData.is_visible,
      };

      if (editingEdu) {
        await updateAdminEducation(editingEdu.id, payload);
        showToast?.('success', 'Education record updated!');
      } else {
        await createAdminEducation(payload);
        showToast?.('success', 'New education record added!');
      }

      setIsModalOpen(false);
      await loadEducation();
      await refreshData();
    } catch (err) {
      console.error('Save education error:', err);
      showToast?.('error', err.message || 'Failed to save education record.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAdminEducation(deleteTarget.id);
      showToast?.('success', `Deleted education at "${deleteTarget.institution}".`);
      setDeleteTarget(null);
      await loadEducation();
      await refreshData();
    } catch (err) {
      showToast?.('error', err.message || 'Failed to delete record.');
    }
  };

  return (
    <div className="admin-education-manager">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Education</h1>
          <p className="admin-view-subtitle">Manage university degrees, coursework, and academic credentials</p>
        </div>
        <div className="admin-view-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Education
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 0.5rem', color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading education records...</p>
        </div>
      ) : educationList.length === 0 ? (
        <div className="admin-card admin-empty-state">
          <GraduationCap size={40} />
          <h3>No education records found</h3>
          <p>Add your degrees or university information.</p>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Add Education
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {educationList.map((edu) => (
            <div key={edu.id} className="admin-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '0.5rem',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                      {edu.degree}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0' }}>
                      {edu.institution}
                    </p>
                    <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} /> {edu.duration || `${edu.start_year} - ${edu.end_year}`}
                      </span>
                      {edu.cgpa && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 600 }}>
                          <Award size={13} /> CGPA: {edu.cgpa}
                        </span>
                      )}
                      {edu.status && (
                        <span className="admin-badge admin-badge--info">{edu.status}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--icon-only"
                    onClick={() => handleOpenEdit(edu)}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger admin-btn--icon-only"
                    onClick={() => setDeleteTarget(edu)}
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

      {/* Add / Edit Education Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingEdu ? 'Edit Education' : 'Add Education'}
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
                  <label>Institution / University *</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. University of Petroleum and Energy Studies (UPES)"
                    required
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Degree *</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      placeholder="e.g. B.Tech in Computer Science and Engineering"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Specialization</label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g. Computer Science and Engineering"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Start Year *</label>
                    <input
                      type="text"
                      value={formData.start_year}
                      onChange={(e) => setFormData({ ...formData, start_year: e.target.value })}
                      placeholder="e.g. 2024"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>End Year *</label>
                    <input
                      type="text"
                      value={formData.end_year}
                      onChange={(e) => setFormData({ ...formData, end_year: e.target.value })}
                      placeholder="e.g. 2028"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Current Status</label>
                    <input
                      type="text"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      placeholder="e.g. Third Year / 5th Semester"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>CGPA / Grade</label>
                    <input
                      type="text"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      placeholder="e.g. 8.9 / 10"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Dehradun, India"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Coursework Description & Focus</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Relevant subjects, honors, societies..."
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
                  {saving ? 'Saving...' : editingEdu ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Education Record"
        message={`Are you sure you want to delete your education record at "${deleteTarget?.institution}"?`}
        confirmText="Yes, Delete Record"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default EducationManager;
