import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import { RefreshCw, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export const AdminRoute = () => {
  const { user, loading, isAdmin, checkingAdmin, isPasswordRecovery, signOut } = useAuth();

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
            Unauthorized Access
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            You are signed in as <strong style={{ color: 'var(--color-text)' }}>{user.email}</strong>, but this account does not have administrator privileges.
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
            Only users whose Supabase UUID is registered in <code>public.admin_users</code> are authorized to access this dashboard.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={signOut}
              className="admin-btn admin-btn--primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: '#ef4444',
                borderColor: '#ef4444',
              }}
            >
              <LogOut size={16} /> Sign Out of This Account
            </button>

            <a
              href="/"
              className="admin-btn admin-btn--secondary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <ArrowLeft size={16} /> Return to Public Portfolio
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 5. Authenticated Administrator -> Full Dashboard Access
  return <AdminLayout />;
};

export default AdminRoute;
