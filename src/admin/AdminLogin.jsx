import React, { useState } from 'react';
import { Mail, KeyRound, AlertCircle, ArrowLeft, CheckCircle2, HelpCircle, ShieldCheck, Info } from 'lucide-react';
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
            <span className="admin-login-eyebrow">Abhishek Agrawal Portfolio</span>
            <div className="admin-login-badge admin-login-badge--success">
              <KeyRound size={22} />
            </div>
            <h1 className="admin-login-title">Set New Admin Password</h1>
            <p className="admin-login-subtitle">
              Choose a new, secure password for the portfolio owner account
            </p>
          </div>

          {error && (
            <div className="admin-login-alert admin-login-alert--error" role="alert">
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
                    name="newPassword"
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
                    name="confirmPassword"
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
        {/* Brand Header */}
        <div className="admin-login-header">
          <span className="admin-login-eyebrow">Abhishek Agrawal Portfolio</span>
          <div className="admin-login-badge">
            <ShieldCheck size={22} />
          </div>
          <h1 className="admin-login-title">Private Administrator Access</h1>
          <p className="admin-login-subtitle">
            Owner CMS for portfolio content management
          </p>
        </div>

        {/* Prominent Visitor Information Box */}
        <div className="admin-visitor-notice">
          <div className="admin-visitor-notice-header">
            <Info size={16} className="admin-visitor-notice-icon" />
            <span className="admin-visitor-notice-title">Visiting Abhishek's Portfolio?</span>
          </div>
          <p className="admin-visitor-notice-text">
            This login is exclusively for the portfolio owner. Visitors do not need an account to view this portfolio.
          </p>
          <a href="/" className="admin-btn admin-btn--secondary admin-visitor-return-btn">
            <ArrowLeft size={15} /> Return to Public Portfolio
          </a>
        </div>

        {!isConfigured && (
          <div className="admin-login-alert admin-login-alert--warning" role="alert">
            <AlertCircle size={20} className="alert-icon" />
            <div>
              <strong>Supabase Configuration Notice:</strong>
              <p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to connect the database.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="admin-login-alert admin-login-alert--error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Administrator Login Form */}
        <form className="admin-login-form" onSubmit={handleSubmit} noValidate={false}>
          <div className="admin-form-group">
            <label htmlFor="login-email">Portfolio Owner Email</label>
            <div className="admin-input-icon-wrapper">
              <Mail size={16} className="admin-input-icon" />
              <input
                id="login-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@abhishekagrawal.dev"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <div className="admin-form-label-row">
              <label htmlFor="login-password">Master Password</label>
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
                name="password"
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
            {loading ? 'Authenticating...' : 'Sign In as Owner'}
          </button>
        </form>

        {/* Security & Authentication Disclaimer */}
        <div className="admin-security-note">
          <ShieldCheck size={14} className="admin-security-icon" />
          <span>
            Authentication is handled securely by Supabase. Access is strictly authorized by owner UUID.
          </span>
        </div>

        {/* Footer Navigation */}
        <div className="admin-login-footer">
          <a href="/" className="admin-back-link">
            <ArrowLeft size={14} /> Return to Public Portfolio
          </a>
        </div>
      </div>

      {/* Password Reset Modal for Owner */}
      {showResetModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal__header">
              <div className="confirm-modal__icon">
                <HelpCircle size={24} />
              </div>
              <div>
                <span className="admin-login-eyebrow" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>
                  Abhishek Agrawal Portfolio
                </span>
                <h3 className="confirm-modal__title">Reset Administrator Password</h3>
              </div>
            </div>
            <div className="confirm-modal__body">
              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <CheckCircle2 size={36} color="#10b981" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ color: 'var(--color-text)', fontWeight: 600 }}>Password reset email sent!</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    If <strong>{resetEmail}</strong> matches the registered administrator account, a recovery link has been dispatched.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    Enter your registered administrator email address to receive a secure password recovery link.
                  </p>
                  <div className="admin-form-group">
                    <label htmlFor="reset-email">Administrator Email</label>
                    <input
                      id="reset-email"
                      name="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="owner@abhishekagrawal.dev"
                      required
                      autoComplete="username"
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
