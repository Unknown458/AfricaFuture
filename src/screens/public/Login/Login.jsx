import { useEffect, useState } from 'react';
import { verifyUser } from '../../../services/user/user';
import '../../../styles/admin.css';

const CURRENT_YEAR = new Date().getFullYear();

export function Login({
  onNavigate,
  screenTitle = 'Admin Login',
  brandName = 'Admin',
  logoTag = 'AF',
  redirectPath = '/admin',
}) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `${screenTitle} | ${brandName}`;
  }, [screenTitle, brandName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Calls real Axios API: POST /api/Admin/login (routed via Vite proxy to prevent CORS 405)
      const response = await verifyUser({
        userName,
        password,
        company: brandName,
      });

      const body = response?.data || {};
      const httpOk = response?.status === 200 || response?.status === 201;
      // The API replies HTTP 200 with { success: false, message: "..." } for bad credentials
      const apiRejected = body.success === false || body.isSuccess === false;

      if (httpOk && !apiRejected) {
        setLoading(false);
        onNavigate(redirectPath);
        return;
      }

      const serverMsg =
        body.message ||
        body.title ||
        body.error ||
        (response?.status === 401
          ? 'Invalid username or password.'
          : response?.status === 405
            ? '405 Method Not Allowed - check proxy or CORS'
            : response?.status === 400
              ? 'Invalid username or password.'
              : 'Login failed. Invalid username or password.');

      setError(serverMsg);
      setLoading(false);
    } catch (err) {
      console.warn('Login request error:', err);
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="adm-login-page">
      {/* Left brand panel */}
      <aside className="adm-login-brand">
        <div className="adm-login-brand-glow g1" />
        <div className="adm-login-brand-glow g2" />

        <button type="button" className="adm-login-logo" onClick={() => onNavigate('/')}>
          <span className="adm-logo-mark">{logoTag}</span>
          <span className="adm-logo-text">
            Admin<span>Portal</span>
          </span>
        </button>

        <div className="adm-login-brand-copy">
          <span className="adm-pill">Content Management</span>
          <h1>
            Manage website content <span>with ease.</span>
          </h1>
          <p>
            Upload images, create promotions and update website banners from your dedicated {brandName}
            {' '}portal.
          </p>

          <ul className="adm-login-features">
            <li>
              <span>🔐</span> Secure &amp; dedicated admin access
            </li>
            <li>
              <span>🖼️</span> Upload &amp; organise gallery images
            </li>
            <li>
              <span>🏷️</span> Create &amp; schedule promotions
            </li>
          </ul>
        </div>

        <p className="adm-login-brand-foot">© {CURRENT_YEAR} CrystalTechnoSoft. All rights reserved.</p>
      </aside>

      {/* Right form panel */}
      <main className="adm-login-main">
        <form className="adm-login-card" onSubmit={handleSubmit} noValidate>
          <div className="adm-login-card-head">
            <div className="adm-login-lock">🔒</div>
            <h2>{screenTitle}</h2>
            <p>Sign in to your {brandName.toLowerCase()} administration panel</p>
          </div>

          <label className="adm-field">
            <span className="adm-label">Username</span>
            <div className="adm-input-wrap">
              <span className="adm-input-icon">👤</span>
              <input
                type="text"
                className="adm-input"
                placeholder="e.g. admin"
                autoComplete="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoFocus
              />
            </div>
          </label>

          <label className="adm-field">
            <span className="adm-label">Password</span>
            <div className="adm-input-wrap">
              <span className="adm-input-icon">🔑</span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="adm-input"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="adm-input-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={loading}>
            {loading ? (
              <>
                <span className="adm-spinner" /> Signing in…
              </>
            ) : (
              'Sign In →'
            )}
          </button>

          <button type="button" className="adm-login-back" onClick={() => onNavigate('/')}>
            ← Back to website
          </button>
        </form>
      </main>

      {/* Login failure dialog */}
      {error && (
        <div className="adm-modal-backdrop" onClick={() => setError('')}>
          <div
            className="adm-modal adm-modal--sm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="adm-login-error-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-head">
              <div>
                <h3 id="adm-login-error-title">Login Failed</h3>
                <p>We couldn’t sign you in.</p>
              </div>
            </div>
            <div className="adm-modal-body">
              <div className="adm-alert adm-alert--error" role="alert" style={{ margin: 0 }}>
                {error}
              </div>
            </div>
            <div className="adm-modal-foot">
              <button
                type="button"
                className="adm-btn adm-btn--primary"
                onClick={() => setError('')}
                autoFocus
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
