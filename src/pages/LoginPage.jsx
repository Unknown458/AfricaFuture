import { useEffect, useState } from 'react';
import { login } from '../services/auth';
import '../styles/admin.css';

const CURRENT_YEAR = new Date().getFullYear();

function LoginPage({ onNavigate }) {
  const [company, setCompany] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Admin Login | Portal';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    await login(company, username, password, remember);
    await new Promise((r) => setTimeout(r, 200));
    setLoading(false);

    onNavigate('/admin');
  };

  return (
    <div className="adm-login-page">
      {/* Left brand panel */}
      <aside className="adm-login-brand">
        <div className="adm-login-brand-glow g1" />
        <div className="adm-login-brand-glow g2" />

        <button type="button" className="adm-login-logo" onClick={() => onNavigate('/')}>
          <span className="adm-logo-mark">AF</span>
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
            Upload images, create promotions and update website banners from your dedicated company
            portal.
          </p>

          <ul className="adm-login-features">
            <li>
              <span>🏢</span> Company &amp; role-based access
            </li>
            <li>
              <span>🖼️</span> Upload &amp; organise gallery images
            </li>
            <li>
              <span>🏷️</span> Create &amp; schedule promotions
            </li>
          </ul>
        </div>

        <p className="adm-login-brand-foot">© {CURRENT_YEAR} Admin Portal. All rights reserved.</p>
      </aside>

      {/* Right form panel */}
      <main className="adm-login-main">
        <form className="adm-login-card" onSubmit={handleSubmit} noValidate>
          <div className="adm-login-card-head">
            <div className="adm-login-lock">🔒</div>
            <h2>Company Login</h2>
            <p>Sign in to your administration panel</p>
          </div>

          {error && (
            <div className="adm-alert adm-alert--error" role="alert">
              {error}
            </div>
          )}

          <label className="adm-field">
            <span className="adm-label">Company Name</span>
            <div className="adm-input-wrap">
              <span className="adm-input-icon">🏢</span>
              <input
                type="text"
                className="adm-input"
                placeholder="e.g. AfricaFuture"
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                autoFocus
              />
            </div>
          </label>

          <label className="adm-field">
            <span className="adm-label">Username</span>
            <div className="adm-input-wrap">
              <span className="adm-input-icon">👤</span>
              <input
                type="text"
                className="adm-input"
                placeholder="e.g. admin"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

          <label className="adm-check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Keep me signed in for 7 days</span>
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
    </div>
  );
}

export default LoginPage;
