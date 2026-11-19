import React, { useState } from 'react';
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  BookOpen,
  FileText,
  Share2,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

import Toast from './components/Toast';
import DashboardHome from './views/DashboardHome';
import ProfileManager from './views/ProfileManager';
import ProjectsManager from './views/ProjectsManager';
import ExperienceManager from './views/ExperienceManager';
import EducationManager from './views/EducationManager';
import SkillsManager from './views/SkillsManager';
import CertificatesManager from './views/CertificatesManager';
import AchievementsManager from './views/AchievementsManager';
import PublicationsManager from './views/PublicationsManager';
import ResumeManager from './views/ResumeManager';
import SocialLinksManager from './views/SocialLinksManager';
import SiteSettingsManager from './views/SiteSettingsManager';

import './adminCommon.css';
import './AdminLayout.css';

export const AdminLayout = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'publications', label: 'Publications / Research', icon: BookOpen },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'social_links', label: 'Social Links', icon: Share2 },
    { id: 'site_settings', label: 'Site Settings', icon: Settings },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome setActiveTab={setActiveTab} showToast={showToast} />;
      case 'profile':
        return <ProfileManager showToast={showToast} />;
      case 'projects':
        return <ProjectsManager showToast={showToast} />;
      case 'experience':
        return <ExperienceManager showToast={showToast} />;
      case 'education':
        return <EducationManager showToast={showToast} />;
      case 'skills':
        return <SkillsManager showToast={showToast} />;
      case 'certificates':
        return <CertificatesManager showToast={showToast} />;
      case 'achievements':
        return <AchievementsManager showToast={showToast} />;
      case 'publications':
        return <PublicationsManager showToast={showToast} />;
      case 'resume':
        return <ResumeManager showToast={showToast} />;
      case 'social_links':
        return <SocialLinksManager showToast={showToast} />;
      case 'site_settings':
        return <SiteSettingsManager showToast={showToast} />;
      default:
        return <DashboardHome setActiveTab={setActiveTab} showToast={showToast} />;
    }
  };

  return (
    <div className="admin-app-container">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <ShieldCheck size={22} color="#3b82f6" />
            <span>Portfolio Admin</span>
          </div>
          <button
            type="button"
            className="admin-sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} className="admin-nav-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              <User size={16} />
            </div>
            <div className="admin-user-details">
              <span className="admin-user-email" title={user?.email || 'Admin'}>
                {user?.email || 'admin@portfolio.local'}
              </span>
              <span className="admin-user-role">Super Admin</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={signOut}
            title="Sign Out"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <span className="admin-topbar-title">
              {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </span>
          </div>

          <div className="admin-topbar-right">
            <button
              type="button"
              className="admin-topbar-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-topbar-btn admin-view-site-link"
              title="View Public Portfolio in new tab"
            >
              <ExternalLink size={15} />
              <span className="hide-mobile">Public Site</span>
            </a>
          </div>
        </header>

        {/* View Body */}
        <main className="admin-content-view">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Toast */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminLayout;
