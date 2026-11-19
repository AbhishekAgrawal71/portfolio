import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Eye,
  Sliders,
  Type,
  Check
} from 'lucide-react';
import {
  getAdminSiteSettings,
  updateAdminSiteSetting
} from '../../services/portfolioService';
import { usePortfolioData } from '../../context/PortfolioContext';

export const SiteSettingsManager = ({ showToast }) => {
  const { settings: initialSettings, refreshData } = usePortfolioData();
  const [settings, setSettings] = useState({
    show_projects: 'true',
    show_experience: 'true',
    show_education: 'true',
    show_skills: 'true',
    show_certificates: 'true',
    show_achievements: 'true',
    show_publications: 'true',
    hero_greeting: "Hello, I'm",
    contact_note: "* The contact form will open your default email client.",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getAdminSiteSettings();
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Could not load site settings from DB:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true',
    }));
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await Promise.all(
        Object.entries(settings).map(([k, v]) => updateAdminSiteSetting(k, v))
      );
      await refreshData();
      showToast?.('success', 'Site settings saved successfully!');
    } catch (err) {
      console.error('Save settings error:', err);
      showToast?.('error', err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { key: 'show_projects', label: 'Projects Section', desc: 'Display project cards and dynamic category filters' },
    { key: 'show_experience', label: 'Experience Section', desc: 'Display employment timeline and internship roles' },
    { key: 'show_education', label: 'Education Section', desc: 'Display degree details, CGPA, and coursework' },
    { key: 'show_skills', label: 'Skills Section', desc: 'Display categorized badges and technical tools' },
    { key: 'show_certificates', label: 'Certificates Section', desc: 'Display online certifications and verified credentials' },
    { key: 'show_achievements', label: 'Achievements Section', desc: 'Display student chapter & leadership responsibilities' },
    { key: 'show_publications', label: 'Publications / Research Section', desc: 'Display academic research papers and preprints' },
  ];

  return (
    <div className="admin-site-settings-manager">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Site Settings</h1>
          <p className="admin-view-subtitle">Enable or disable public portfolio sections and customize homepage copy</p>
        </div>
      </div>

      <form onSubmit={handleSaveAll}>
        {/* Section Toggles */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <Sliders size={20} color="#3b82f6" />
            <h3 className="admin-card-title" style={{ margin: 0 }}>Section Visibility Controls</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sections.map((sec) => {
              const isEnabled = settings[sec.key] === 'true';
              return (
                <div
                  key={sec.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.5rem',
                    background: 'var(--color-bg, #0a0a0f)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.925rem' }}>
                      {sec.label}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                      {sec.desc}
                    </div>
                  </div>

                  <label className="admin-switch-label">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggle(sec.key)}
                    />
                    <span style={{ fontSize: '0.85rem', color: isEnabled ? '#10b981' : 'var(--color-text-muted)' }}>
                      {isEnabled ? 'Enabled' : 'Hidden'}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Homepage Text Overrides */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <Type size={20} color="#8b5cf6" />
            <h3 className="admin-card-title" style={{ margin: 0 }}>Homepage Text Customization</h3>
          </div>

          <div className="admin-form-group">
            <label>Hero Section Greeting Prefix</label>
            <input
              type="text"
              value={settings.hero_greeting || ''}
              onChange={(e) => setSettings({ ...settings, hero_greeting: e.target.value })}
              placeholder="e.g. Hello, I'm"
            />
          </div>

          <div className="admin-form-group">
            <label>Contact Form Note (Footer)</label>
            <input
              type="text"
              value={settings.contact_note || ''}
              onChange={(e) => setSettings({ ...settings, contact_note: e.target.value })}
              placeholder="* The contact form will open your default email client."
            />
          </div>
        </div>

        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={saving}
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
        >
          {saving ? <RefreshCw size={16} className="spin-icon" /> : <Save size={16} />}
          {saving ? 'Saving Settings...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
};

export default SiteSettingsManager;
