import { useEffect, useState } from 'react';
import { verifyUser } from '../../../services/user/user';
import { setTokens } from '../../../utils/authToken';
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
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `${screenTitle} | Portal`;
  }, [screenTitle]);

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
        remember,
      });

      if (response && (response.status === 200 || response.status === 201)) {
        setLoading(false);
        onNavigate(redirectPath);
        return;
      }

      const serverMsg =
        response?.data?.message ||
        response?.data?.title ||
        response?.data?.error ||
        (response?.status === 405 ? '405 Method Not Allowed - check proxy or CORS' : 'Invalid username or password');

      setError(serverMsg);
      setLoading(false);
    } catch (err) {
      console.warn('Login request error:', err);
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleTestBypass = () => {
    // Set mock tokens so Private container allows access
    setTokens({
      accessToken: `mock_access_${Date.now()}`,
      accessTokenExpiry: new Date(Date.now() + 3600 * 1000).toISOString(),
      refreshToken: `mock_refresh_${Date.now()}`,
      refreshTokenExpiry: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
      userName: userName || 'preview',
      company: brandName,
      isSuperAdmin: false,
      remember: false,
    });
    onNavigate(redirectPath);
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
            {brandName}<span>Portal</span>
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

        <p className="adm-login-brand-foot">© {CURRENT_YEAR} {brandName} Portal. All rights reserved.</p>
      </aside>

      {/* Right form panel */}
      <main className="adm-login-main">
        <form className="adm-login-card" onSubmit={handleSubmit} noValidate>
          <div className="adm-login-card-head">
            <div className="adm-login-lock">🔒</div>
            <h2>{screenTitle}</h2>
            <p>Sign in to your {brandName.toLowerCase()} administration panel</p>
          </div>

          {error && (
            <div className="adm-alert adm-alert--error" role="alert">
              <div>{error}</div>
              <button
                type="button"
                className="adm-link"
                style={{ marginTop: 6, fontSize: '0.8rem', color: '#b91c1c', textDecoration: 'underline' }}
                onClick={handleTestBypass}
              >
                Or enter in preview / demo mode →
              </button>
            </div>
          )}

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

export default Login;
