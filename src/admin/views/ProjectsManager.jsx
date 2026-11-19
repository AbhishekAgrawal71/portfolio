import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Star,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  ExternalLink,
  X,
  Save,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import {
  getAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject
} from '../../services/portfolioService';
import { uploadFile, deleteFile, BUCKETS } from '../../services/storageService';
import ConfirmModal from '../components/ConfirmModal';
import { usePortfolioData } from '../../context/PortfolioContext';

export const ProjectsManager = ({ showToast }) => {
  const { refreshData } = usePortfolioData();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const defaultForm = {
    title: '',
    description: '',
    long_description: '',
    technologies: '',
    category: 'Machine Learning',
    date: '2025',
    github_url: '',
    live_demo_url: '',
    image_url: '',
    is_featured: false,
    is_visible: true,
    sort_order: 0,
  };
  const [formData, setFormData] = useState(defaultForm);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAdminProjects();
      setProjects(data || []);
    } catch (err) {
      console.warn('Could not load projects from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      ...defaultForm,
      sort_order: projects.length,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    const techs = Array.isArray(project.technologies)
      ? project.technologies.join(', ')
      : (project.technologies ? JSON.parse(project.technologies).join(', ') : '');

    setFormData({
      title: project.title || '',
      description: project.description || '',
      long_description: project.long_description || '',
      technologies: techs,
      category: project.category || 'General',
      date: project.date || '',
      github_url: project.github_url || '',
      live_demo_url: project.live_demo_url || '',
      image_url: project.image_url || '',
      is_featured: !!project.is_featured,
      is_visible: project.is_visible !== false,
      sort_order: project.sort_order ?? 0,
    });
    setIsModalOpen(true);
  };

  const handleDuplicate = async (project) => {
    try {
      const copy = {
        ...project,
        title: `${project.title} (Copy)`,
        sort_order: projects.length,
      };
      delete copy.id;
      delete copy.created_at;
      delete copy.updated_at;

      await createAdminProject(copy);
      await loadProjects();
      await refreshData();
      showToast?.('success', `Duplicated "${project.title}"!`);
    } catch (err) {
      showToast?.('error', err.message || 'Failed to duplicate project.');
    }
  };

  const handleToggleFeatured = async (project) => {
    try {
      await updateAdminProject(project.id, { is_featured: !project.is_featured });
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_featured: !p.is_featured } : p));
      await refreshData();
      showToast?.('success', `Updated featured status.`);
    } catch (err) {
      showToast?.('error', err.message || 'Failed to update.');
    }
  };

  const handleToggleVisible = async (project) => {
    try {
      await updateAdminProject(project.id, { is_visible: !project.is_visible });
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_visible: !p.is_visible } : p));
      await refreshData();
      showToast?.('success', `Updated visibility status.`);
    } catch (err) {
      showToast?.('error', err.message || 'Failed to update.');
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const list = [...projects];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    // Update sort_order for each
    try {
      setProjects(list);
      await Promise.all(
        list.map((item, idx) => updateAdminProject(item.id, { sort_order: idx }))
      );
      await refreshData();
    } catch (err) {
      showToast?.('error', 'Failed to reorder projects.');
      await loadProjects();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const publicUrl = await uploadFile(BUCKETS.PROJECTS, file);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      showToast?.('success', 'Project image uploaded successfully!');
    } catch (err) {
      showToast?.('error', err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast?.('error', 'Project title is required.');
      return;
    }

    try {
      setSaving(true);
      const techArray = formData.technologies
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        description: formData.description,
        long_description: formData.long_description,
        technologies: techArray,
        category: formData.category,
        date: formData.date,
        github_url: formData.github_url,
        live_demo_url: formData.live_demo_url,
        image_url: formData.image_url,
        is_featured: formData.is_featured,
        is_visible: formData.is_visible,
        sort_order: formData.sort_order,
      };

      if (editingProject) {
        await updateAdminProject(editingProject.id, payload);
        showToast?.('success', 'Project updated successfully!');
      } else {
        await createAdminProject(payload);
        showToast?.('success', 'New project created successfully!');
      }

      setIsModalOpen(false);
      await loadProjects();
      await refreshData();
    } catch (err) {
      console.error('Save project error:', err);
      showToast?.('error', err.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAdminProject(deleteTarget.id);
      if (deleteTarget.image_url && deleteTarget.image_url.includes(BUCKETS.PROJECTS)) {
        await deleteFile(BUCKETS.PROJECTS, deleteTarget.image_url);
      }
      showToast?.('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      await loadProjects();
      await refreshData();
    } catch (err) {
      showToast?.('error', err.message || 'Failed to delete project.');
    }
  };

  return (
    <div className="admin-projects-manager">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Projects</h1>
          <p className="admin-view-subtitle">Manage, reorder, and showcase your software & machine learning projects</p>
        </div>
        <div className="admin-view-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 0.5rem', color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="admin-card admin-empty-state">
          <FolderGit2 size={40} />
          <h3>No projects found in database</h3>
          <p>Click "Add Project" or seed your database from the Overview tab.</p>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAdd} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Add Project
          </button>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Order</th>
                <th>Title</th>
                <th>Category</th>
                <th>Technologies</th>
                <th style={{ textAlign: 'center' }}>Featured</th>
                <th style={{ textAlign: 'center' }}>Visible</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, idx) => (
                <tr key={project.id}>
                  <td>
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
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
                        disabled={idx === projects.length - 1}
                        onClick={() => handleMoveOrder(idx, 1)}
                        title="Move Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{project.title}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.description}
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge--info">{project.category}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '240px' }}>
                      {(Array.isArray(project.technologies) ? project.technologies : []).slice(0, 3).map((t, tIdx) => (
                        <span key={tIdx} className="admin-badge admin-badge--muted">{t}</span>
                      ))}
                      {(project.technologies?.length || 0) > 3 && (
                        <span className="admin-badge admin-badge--muted">+{project.technologies.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn--secondary admin-btn--icon-only"
                      onClick={() => handleToggleFeatured(project)}
                      title={project.is_featured ? 'Unmark featured' : 'Mark as featured'}
                      style={{ color: project.is_featured ? '#eab308' : 'var(--color-text-muted)' }}
                    >
                      <Star size={16} fill={project.is_featured ? '#eab308' : 'none'} />
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn--secondary admin-btn--icon-only"
                      onClick={() => handleToggleVisible(project)}
                      title={project.is_visible ? 'Hide project' : 'Show project'}
                      style={{ color: project.is_visible ? '#10b981' : 'var(--color-text-muted)' }}
                    >
                      {project.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn--secondary admin-btn--icon-only"
                        onClick={() => handleDuplicate(project)}
                        title="Duplicate"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--secondary admin-btn--icon-only"
                        onClick={() => handleOpenEdit(project)}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--icon-only"
                        onClick={() => setDeleteTarget(project)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingProject ? 'Edit Project' : 'Add New Project'}
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
                  <label>Project Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Placement Prediction Model"
                    required
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Category *</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Machine Learning, Python, Java, C/C++"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Completion Date</label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="e.g. 2025"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Technologies (comma separated) *</label>
                  <input
                    type="text"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    placeholder="Python, Scikit-learn, Pandas, NumPy"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Short Description (shown on card) *</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Concise 1-2 sentence overview..."
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Long Description (detailed writeup)</label>
                  <textarea
                    rows={4}
                    value={formData.long_description}
                    onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                    placeholder="Detailed explanation of methodology, problem solved, architecture..."
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>GitHub URL</label>
                    <input
                      type="url"
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      placeholder="https://github.com/AbhishekAgrawal71/repo"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Live Demo URL</label>
                    <input
                      type="url"
                      value={formData.live_demo_url}
                      onChange={(e) => setFormData({ ...formData, live_demo_url: e.target.value })}
                      placeholder="https://my-project.vercel.app"
                    />
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="admin-form-group">
                  <label>Project Screenshot</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://... or /projects/image.png"
                      style={{ flex: 1 }}
                    />
                    <label className="admin-btn admin-btn--secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {uploadingImage ? <RefreshCw size={14} className="spin-icon" /> : <Upload size={14} />}
                      {uploadingImage ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  {formData.image_url && (
                    <div style={{ marginTop: '0.5rem', width: '100%', height: '100px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="admin-form-row" style={{ marginTop: '0.75rem' }}>
                  <label className="admin-switch-label">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    />
                    <span>Featured Project (shown prominently)</span>
                  </label>

                  <label className="admin-switch-label">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                    />
                    <span>Visible on public site</span>
                  </label>
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
                  {saving ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
        confirmText="Yes, Delete Project"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProjectsManager;
