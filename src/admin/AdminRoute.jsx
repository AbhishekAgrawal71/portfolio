import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import { RefreshCw, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export const AdminRoute = () => {
  const { user, loading, isAdmin, checkingAdmin, isPasswordRecovery, signOut } = useAuth();

  // Dynamic search indexing guard and document title management
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Private Admin | Abhishek Agrawal Portfolio';

    // Inject <meta name="robots" content="noindex, nofollow">
    let metaRobots = document.querySelector('meta[name="robots"]');
    let created = false;

    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      metaRobots.setAttribute('content', 'noindex, nofollow');
      document.head.appendChild(metaRobots);
      created = true;
    } else {
      metaRobots.setAttribute('data-prev-content', metaRobots.getAttribute('content') || '');
      metaRobots.setAttribute('content', 'noindex, nofollow');
    }

    return () => {
      document.title = previousTitle || 'Abhishek Agrawal | Software Developer & Computer Science Student';
      if (created && metaRobots && metaRobots.parentNode) {
        metaRobots.parentNode.removeChild(metaRobots);
      } else if (metaRobots) {
        const prev = metaRobots.getAttribute('data-prev-content');
        if (prev) {
          metaRobots.setAttribute('content', prev);
          metaRobots.removeAttribute('data-prev-content');
        } else if (metaRobots.parentNode) {
          metaRobots.parentNode.removeChild(metaRobots);
        }
      }
    };
  }, []);

  // 1. Loading / Verification State
  if (loading || checkingAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg, #0a0a0f)',
        color: 'var(--color-text, #e4e4e7)',
        gap: '1rem',
        padding: '1.5rem',
        textAlign: 'center',
      }}>
        <RefreshCw size={32} className="spin-icon" color="var(--color-primary, #3b82f6)" />
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary, #a1a1aa)' }}>
          Verifying administrator authorization...
        </p>
      </div>
    );
  }

  // 2. Active Password Recovery Flow
  if (isPasswordRecovery) {
    return <AdminLogin isRecoveryMode={true} />;
  }

  // 3. Unauthenticated Visitor -> Show Login Form
  if (!user) {
    return <AdminLogin />;
  }

  // 4. Authenticated NON-ADMIN -> Show Unauthorized Access Warning
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg, #0a0a0f)',
        color: 'var(--color-text, #e4e4e7)',
        padding: '1.5rem',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--color-surface, #12121a)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '1rem',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--color-primary, #3b82f6)',
            marginBottom: '1rem',
          }}>
            Abhishek Agrawal Portfolio
          </div>

          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <ShieldAlert size={30} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Private Administration
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            You are signed in as <strong style={{ color: 'var(--color-text)' }}>{user.email}</strong>, but this account does not have administrator privileges for this portfolio.
          </p>

          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            fontSize: '0.825rem',
            color: '#f87171',
            marginBottom: '1.75rem',
            textAlign: 'left',
          }}>
            This area is strictly restricted to the portfolio owner (Abhishek Agrawal). Visitors do not need an account and can freely browse the public portfolio.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a
              href="/"
              className="admin-btn admin-btn--primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} /> Return to Public Portfolio
            </a>

            <button
              type="button"
              onClick={signOut}
              className="admin-btn admin-btn--secondary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <LogOut size={16} /> Sign Out of This Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Authenticated Administrator -> Full Dashboard Access
  return <AdminLayout />;
};

export default AdminRoute;
