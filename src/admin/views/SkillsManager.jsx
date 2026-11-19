import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Wrench,
  Code,
  Globe,
  Brain,
  Library,
  Cpu,
  Database,
  Server,
  Terminal,
  Laptop,
  X,
  Save,
  RefreshCw,
  Check
} from 'lucide-react';
import {
  getAdminSkillCategories,
  createAdminSkillCategory,
  updateAdminSkillCategory,
  deleteAdminSkillCategory,
  createAdminSkill,
  deleteAdminSkill
} from '../../services/portfolioService';
import ConfirmModal from '../components/ConfirmModal';
import { usePortfolioData } from '../../context/PortfolioContext';

const AVAILABLE_ICONS = [
  { name: 'Code', icon: Code },
  { name: 'Globe', icon: Globe },
  { name: 'Brain', icon: Brain },
  { name: 'Library', icon: Library },
  { name: 'Cpu', icon: Cpu },
  { name: 'Wrench', icon: Wrench },
  { name: 'Database', icon: Database },
  { name: 'Server', icon: Server },
  { name: 'Terminal', icon: Terminal },
  { name: 'Laptop', icon: Laptop },
];

export const SkillsManager = ({ showToast }) => {
  const { refreshData } = usePortfolioData();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('Code');
  const [savingCat, setSavingCat] = useState(false);

  // New Skill Input states per category { [catId]: string }
  const [newSkillInputs, setNewSkillInputs] = useState({});

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAdminSkillCategories();
      setCategories(data || []);
    } catch (err) {
      console.warn('Could not load skills from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddCat = () => {
    setEditingCat(null);
    setCatName('');
    setCatIcon('Code');
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (cat) => {
    setEditingCat(cat);
    setCatName(cat.name || '');
    setCatIcon(cat.icon || 'Code');
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast?.('error', 'Category name is required.');
      return;
    }

    try {
      setSavingCat(true);
      if (editingCat) {
        await updateAdminSkillCategory(editingCat.id, {
          name: catName,
          icon: catIcon,
        });
        showToast?.('success', 'Skill category updated!');
      } else {
        await createAdminSkillCategory({
          name: catName,
          icon: catIcon,
          sort_order: categories.length,
          is_visible: true,
        });
        showToast?.('success', 'New skill category created!');
      }

      setIsCatModalOpen(false);
      await loadCategories();
      await refreshData();
    } catch (err) {
      console.error('Save category error:', err);
      showToast?.('error', err.message || 'Failed to save category.');
    } finally {
      setSavingCat(false);
    }
  };

  const handleAddSkill = async (categoryId) => {
    const skillName = newSkillInputs[categoryId]?.trim();
    if (!skillName) return;

    try {
      await createAdminSkill(categoryId, skillName);
      setNewSkillInputs(prev => ({ ...prev, [categoryId]: '' }));
      await loadCategories();
      await refreshData();
      showToast?.('success', `Added "${skillName}"!`);
    } catch (err) {
      console.error('Add skill error:', err);
      showToast?.('error', err.message || 'Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    try {
      await deleteAdminSkill(skillId);
      await loadCategories();
      await refreshData();
      showToast?.('success', `Removed "${skillName}".`);
    } catch (err) {
      console.error('Delete skill error:', err);
      showToast?.('error', err.message || 'Failed to delete skill.');
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAdminSkillCategory(deleteTarget.id);
      showToast?.('success', `Deleted category "${deleteTarget.name}".`);
      setDeleteTarget(null);
      await loadCategories();
      await refreshData();
    } catch (err) {
      showToast?.('error', err.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="admin-skills-manager">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Skills & Technologies</h1>
          <p className="admin-view-subtitle">Organize your technical capabilities into categories and badges</p>
        </div>
        <div className="admin-view-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAddCat}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 0.5rem', color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading skills categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="admin-card admin-empty-state">
          <Wrench size={40} />
          <h3>No skill categories found</h3>
          <p>Create a category like "Programming Languages" or "Machine Learning".</p>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleOpenAddCat} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {categories.map((cat) => {
            const IconObj = AVAILABLE_ICONS.find(i => i.name === cat.icon) || AVAILABLE_ICONS[0];
            const IconComp = IconObj.icon;

            return (
              <div key={cat.id} className="admin-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '0.4rem',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--color-primary, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComp size={16} />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                      {cat.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn--secondary admin-btn--icon-only"
                      onClick={() => handleOpenEditCat(cat)}
                      title="Edit Category"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger admin-btn--icon-only"
                      onClick={() => setDeleteTarget(cat)}
                      title="Delete Category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Skills list */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', minHeight: '60px', flex: 1, alignContent: 'flex-start' }}>
                  {(cat.skills || []).map((skill) => (
                    <span
                      key={skill.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.3rem 0.65rem',
                        background: 'var(--color-bg, #0a0a0f)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        color: 'var(--color-text)'
                      }}
                    >
                      {skill.name}
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(skill.id, skill.name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 0 }}
                        title="Remove skill"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {(cat.skills?.length || 0) === 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      No skills added yet in this category.
                    </span>
                  )}
                </div>

                {/* Add new skill inline */}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <input
                    type="text"
                    value={newSkillInputs[cat.id] || ''}
                    onChange={(e) => setNewSkillInputs({ ...newSkillInputs, [cat.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(cat.id);
                      }
                    }}
                    placeholder="Add skill (e.g. React)..."
                    style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.825rem' }}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary admin-btn--sm"
                    onClick={() => handleAddSkill(cat.id)}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isCatModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsCatModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCat ? 'Edit Category' : 'Add Skill Category'}
              </h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsCatModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Web Development, Tools"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Category Icon</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    {AVAILABLE_ICONS.map((i) => {
                      const IconComponent = i.icon;
                      const isSelected = catIcon === i.name;
                      return (
                        <button
                          key={i.name}
                          type="button"
                          onClick={() => setCatIcon(i.name)}
                          style={{
                            padding: '0.75rem 0.5rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${isSelected ? 'var(--color-primary, #3b82f6)' : 'var(--color-border)'}`,
                            background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--color-bg, #0a0a0f)',
                            color: isSelected ? 'var(--color-primary, #3b82f6)' : 'var(--color-text-secondary)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer'
                          }}
                        >
                          <IconComponent size={18} />
                          <span style={{ fontSize: '0.65rem' }}>{i.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setIsCatModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={savingCat}
                >
                  {savingCat ? <RefreshCw size={14} className="spin-icon" /> : <Save size={14} />}
                  {savingCat ? 'Saving...' : editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}" and all skills inside it?`}
        confirmText="Yes, Delete Category"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default SkillsManager;
