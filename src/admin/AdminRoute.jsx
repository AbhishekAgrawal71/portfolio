import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import { RefreshCw } from 'lucide-react';

export const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
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
      }}>
        <RefreshCw size={28} className="spin-icon" color="var(--color-primary, #3b82f6)" />
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary, #a1a1aa)' }}>
          Verifying admin authentication...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return <AdminLayout />;
};

export default AdminRoute;
