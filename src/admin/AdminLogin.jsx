import React, { useState } from 'react';
import { Lock, Mail, KeyRound, AlertCircle, ArrowLeft, CheckCircle2, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

export const AdminLogin = ({ isRecoveryMode = false }) => {
  const { signIn, resetPassword, updatePassword, isPasswordRecovery, setIsPasswordRecovery, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Password recovery form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const isResetting = isRecoveryMode || isPasswordRecovery;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signIn({ email, password });
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please provide an email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(newPassword);
      setRecoverySuccess(true);
      // Clean up URL hash tokens safely
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (err) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password. Please try requesting a new link.');
    } finally {
      setLoading(false);
    }
  };

  // Render Password Recovery / Set New Password Screen
  if (isResetting) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-badge" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.15)' }}>
              <KeyRound size={22} />
            </div>
            <h1 className="admin-login-title">Set New Password</h1>
            <p className="admin-login-subtitle">Choose a new, secure password for your administrator account</p>
          </div>

          {error && (
            <div className="admin-login-alert admin-login-alert--error">
              <AlertCircle size={18} className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {recoverySuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                Password Updated!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                Your administrator password has been updated successfully. You can now access your dashboard.
              </p>
              <button
                type="button"
                className="admin-btn admin-btn--primary admin-btn--block"
                onClick={() => {
                  setIsPasswordRecovery(false);
                }}
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form className="admin-login-form" onSubmit={handleSetNewPassword}>
              <div className="admin-form-group">
                <label htmlFor="new-password">New Password</label>
                <div className="admin-input-icon-wrapper">
                  <KeyRound size={16} className="admin-input-icon" />
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="admin-input-icon-wrapper">
                  <KeyRound size={16} className="admin-input-icon" />
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="admin-btn admin-btn--primary admin-btn--block"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>

              <div className="admin-login-footer" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="admin-back-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setIsPasswordRecovery(false)}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Render Normal Sign In Screen
  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-badge">
            <Lock size={20} />
          </div>
          <h1 className="admin-login-title">Portfolio Admin</h1>
          <p className="admin-login-subtitle">Sign in to manage your portfolio content</p>
        </div>

        {!isConfigured && (
          <div className="admin-login-alert admin-login-alert--warning">
            <AlertCircle size={20} className="alert-icon" />
            <div>
              <strong>Supabase Not Connected Yet:</strong>
              <p>Add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code> file. Check <code>ADMIN_SETUP.md</code> for step-by-step instructions.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="admin-login-alert admin-login-alert--error">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="admin-input-icon-wrapper">
              <Mail size={16} className="admin-input-icon" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <div className="admin-form-label-row">
              <label htmlFor="login-password">Password</label>
              <button
                type="button"
                className="admin-link-btn"
                onClick={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                  setError('');
                }}
              >
                Forgot password?
              </button>
            </div>
            <div className="admin-input-icon-wrapper">
              <KeyRound size={16} className="admin-input-icon" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn--primary admin-btn--block"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/" className="admin-back-link">
            <ArrowLeft size={14} /> Back to public portfolio
          </a>
        </div>
      </div>

      {showResetModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal__header">
              <div className="confirm-modal__icon">
                <HelpCircle size={24} />
              </div>
              <h3 className="confirm-modal__title">Reset Admin Password</h3>
            </div>
            <div className="confirm-modal__body">
              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <CheckCircle2 size={36} color="#10b981" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ color: 'var(--color-text)' }}>Password reset email sent!</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                    Check your inbox at <strong>{resetEmail}</strong> for a password reset link.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <p style={{ marginBottom: '1rem' }}>
                    Enter your admin email and we'll send you a link to reset your password.
                  </p>
                  <div className="admin-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div className="confirm-modal__footer" style={{ marginTop: '1rem', padding: '1rem 0 0 0', background: 'transparent' }}>
                    <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowResetModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
            {resetSent && (
              <div className="confirm-modal__footer">
                <button type="button" className="admin-btn admin-btn--primary" onClick={() => setShowResetModal(false)}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
