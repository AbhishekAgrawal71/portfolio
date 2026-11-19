import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Upload, Save, RefreshCw, Image } from 'lucide-react';
import { getAdminProfile, updateAdminProfile } from '../../services/portfolioService';
import { uploadFile, BUCKETS } from '../../services/storageService';
import { usePortfolioData } from '../../context/PortfolioContext';

export const ProfileManager = ({ showToast }) => {
  const { personal, refreshData } = usePortfolioData();
  const [profileId, setProfileId] = useState(null);
  const [formData, setFormData] = useState({
    name: personal?.name || '',
    title: personal?.title || '',
    taglines: Array.isArray(personal?.taglines) ? personal.taglines.join(', ') : '',
    bio: personal?.bio || '',
    about_me: personal?.aboutMe || '',
    email: personal?.email || '',
    location: personal?.location || '',
    profile_image_url: personal?.profileImage || '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getAdminProfile();
        if (data) {
          setProfileId(data.id);
          setFormData({
            name: data.name || '',
            title: data.title || '',
            taglines: Array.isArray(data.taglines) ? data.taglines.join(', ') : (data.taglines ? JSON.parse(data.taglines).join(', ') : ''),
            bio: data.bio || '',
            about_me: data.about_me || '',
            email: data.email || '',
            location: data.location || '',
            profile_image_url: data.profile_image_url || '',
          });
        }
      } catch (err) {
        console.warn('Could not load profile from DB, using context defaults:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const publicUrl = await uploadFile(BUCKETS.PROFILE, file);
      setFormData(prev => ({ ...prev, profile_image_url: publicUrl }));
      showToast?.('success', 'Profile photo uploaded! Click "Save Changes" to apply.');
    } catch (err) {
      console.error('Image upload failed:', err);
      showToast?.('error', err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileId) {
      showToast?.('error', 'Profile record ID not found in database. Please run seed first.');
      return;
    }

    try {
      setSaving(true);
      const taglinesArray = formData.taglines
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await updateAdminProfile(profileId, {
        name: formData.name,
        title: formData.title,
        taglines: taglinesArray,
        bio: formData.bio,
        about_me: formData.about_me,
        email: formData.email,
        location: formData.location,
        profile_image_url: formData.profile_image_url,
      });

      await refreshData();
      showToast?.('success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Save profile error:', err);
      showToast?.('error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-profile-manager">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Profile Settings</h1>
          <p className="admin-view-subtitle">Manage your personal information, headline, and bio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Main Info */}
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '1.25rem' }}>Personal Details</h3>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Professional Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Computer Science Student | Software Developer"
              />
            </div>

            <div className="admin-form-group">
              <label>Taglines (comma-separated for hero animation)</label>
              <input
                type="text"
                value={formData.taglines}
                onChange={(e) => setFormData({ ...formData, taglines: e.target.value })}
                placeholder="Software Developer, Machine Learning Enthusiast, Problem Solver"
              />
            </div>

            <div className="admin-form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Dehradun, India"
              />
            </div>

            <div className="admin-form-group">
              <label>Short Bio (Hero section)</label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief 1-2 sentence summary..."
              />
            </div>

            <div className="admin-form-group">
              <label>About Me (Detailed narrative in About section)</label>
              <textarea
                rows={6}
                value={formData.about_me}
                onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                placeholder="Write your recruiter-friendly story..."
              />
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={saving}
              style={{ marginTop: '0.5rem' }}
            >
              {saving ? <RefreshCw size={15} className="spin-icon" /> : <Save size={15} />}
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>

          {/* Profile Photo Side Card */}
          <div className="admin-card" style={{ textAlign: 'center' }}>
            <h3 className="admin-card-title" style={{ marginBottom: '1.25rem' }}>Profile Picture</h3>

            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              margin: '0 auto 1.25rem',
              overflow: 'hidden',
              border: '3px solid var(--color-primary, #3b82f6)',
              background: 'var(--color-bg, #0a0a0f)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {formData.profile_image_url ? (
                <img
                  src={formData.profile_image_url}
                  alt="Profile Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={60} color="#71717a" />
              )}
            </div>

            <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
              <label className="admin-btn admin-btn--secondary" style={{ cursor: 'pointer', width: '100%' }}>
                {uploadingImage ? <RefreshCw size={15} className="spin-icon" /> : <Upload size={15} />}
                {uploadingImage ? 'Uploading...' : 'Upload New Photo'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>

            <div className="admin-form-group">
              <label style={{ fontSize: '0.75rem' }}>Or Image URL</label>
              <input
                type="text"
                value={formData.profile_image_url}
                onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                placeholder="/profile/avatar.svg"
                style={{ fontSize: '0.775rem' }}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileManager;
