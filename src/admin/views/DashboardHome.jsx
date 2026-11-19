import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Star,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  BookOpen,
  FileText,
  Plus,
  Upload,
  ExternalLink,
  Database,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { usePortfolioData } from '../../context/PortfolioContext';
import { seedDatabaseFromStatic } from '../../services/seedService';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const DashboardHome = ({ setActiveTab, showToast }) => {
  const {
    projects = [],
    experience = [],
    education = [],
    skills = [],
    certificates = [],
    achievements = [],
    publications = [],
    isFromDb,
    refreshData
  } = usePortfolioData();

  const [seeding, setSeeding] = useState(false);
  const configured = isSupabaseConfigured();

  const totalProjects = projects.length;
  const featuredProjects = projects.filter(p => p.featured || p.is_featured).length;
  const totalExperience = experience.length;
  const totalEducation = education.length;
  const totalSkillCategories = skills.length;
  const totalSkillsCount = skills.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0);
  const totalCertificates = certificates.length;
  const totalAchievements = achievements.length;
  const totalPublications = publications.length;

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await seedDatabaseFromStatic(false);
      showToast?.('success', `Database seeded successfully! Added ${res.projects} projects, ${res.experience} experiences, ${res.skills} skills.`);
      await refreshData();
    } catch (err) {
      console.error('Seed error:', err);
      showToast?.('error', err.message || 'Failed to seed database.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="admin-dashboard-home">
      {/* View Header */}
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Overview</h1>
          <p className="admin-view-subtitle">Welcome to your personal portfolio control center</p>
        </div>
        <div className="admin-view-actions">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--secondary">
            <ExternalLink size={15} /> View Live Portfolio
          </a>
        </div>
      </div>

      {/* Database Connection Banner */}
      <div className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '0.625rem',
            background: isFromDb ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
            color: isFromDb ? '#10b981' : '#eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ color: 'var(--color-text)' }}>Database Source:</strong>
              <span className={`admin-badge ${isFromDb ? 'admin-badge--success' : 'admin-badge--warning'}`}>
                {isFromDb ? 'Supabase Live DB' : 'Local Static Fallback'}
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              {isFromDb
                ? 'Your website is connected directly to your Supabase PostgreSQL database.'
                : configured
                  ? 'Supabase is configured, but tables appear empty. Click "Seed Database" to import all existing portfolio data!'
                  : 'Supabase credentials not found in .env. Falling back to src/data/*.js files.'}
            </p>
          </div>
        </div>

        {configured && !isFromDb ? (
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? <RefreshCw size={15} className="spin-icon" /> : <Sparkles size={15} />}
            {seeding ? 'Seeding...' : 'Seed Database from Static Data'}
          </button>
        ) : isFromDb ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 500, padding: '0.5rem 0.85rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <CheckCircle2 size={16} /> Live Database Synced
          </div>
        ) : null}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="admin-card" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setActiveTab('projects')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Total Projects</span>
            <FolderGit2 size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>{totalProjects}</div>
          <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.25rem' }}>{featuredProjects} featured</div>
        </div>

        <div className="admin-card" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setActiveTab('experience')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Experience</span>
            <Briefcase size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>{totalExperience}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Roles & Internships</div>
        </div>

        <div className="admin-card" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setActiveTab('skills')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Skills</span>
            <Wrench size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>{totalSkillsCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Across {totalSkillCategories} categories</div>
        </div>

        <div className="admin-card" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setActiveTab('certificates')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Certificates</span>
            <Award size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>{totalCertificates}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Verified credentials</div>
        </div>

        <div className="admin-card" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setActiveTab('publications')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Publications</span>
            <BookOpen size={18} color="#ec4899" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>{totalPublications}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Research papers</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h3 className="admin-card-title" style={{ marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
            onClick={() => setActiveTab('projects')}
          >
            <Plus size={16} color="#3b82f6" /> Add New Project
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
            onClick={() => setActiveTab('experience')}
          >
            <Plus size={16} color="#10b981" /> Add Experience
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
            onClick={() => setActiveTab('certificates')}
          >
            <Plus size={16} color="#f59e0b" /> Add Certificate
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
            onClick={() => setActiveTab('resume')}
          >
            <Upload size={16} color="#8b5cf6" /> Upload New Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
