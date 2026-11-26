// -------------------------------------------------------------------------------------------
// Auth Token Storage (CargoJet pattern)
// -------------------------------------------------------------------------------------------

const DEFAULT_TOKEN_KEY = 'af_admin_tokens';

/**
 * Normalizes different date/timestamp formats (.NET ticks, ISO string, milliseconds, seconds)
 */
export const toTimestamp = (val) => {
  if (!val) return null;
  if (typeof val === 'number') {
    if (val < 1e11) return val * 1000;
    return val;
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/\.(\d{3})\d+/, '.$1');
    const t = new Date(cleaned).getTime();
    if (!Number.isNaN(t)) return t;
    const raw = new Date(val).getTime();
    if (!Number.isNaN(raw)) return raw;
  }
  return null;
};

/**
 * Checks whether the overall session or refresh token has expired.
 */
export const isSessionExpired = (tokens) => {
  if (!tokens || !tokens.accessToken) return true;
  const now = Date.now();

  // 1. Refresh token expired -> session is completely expired
  if (tokens.refreshTokenExpiry) {
    const refreshExp = toTimestamp(tokens.refreshTokenExpiry);
    if (refreshExp && refreshExp <= now) {
      return true;
    }
  }

  // 2. Session max-age expired
  if (tokens.expiresAt) {
    const sessExp = toTimestamp(tokens.expiresAt);
    if (sessExp && sessExp <= now) {
      return true;
    }
  }

  // 3. Access token expired and no refresh token exists to refresh it
  if (!tokens.refreshToken && tokens.accessTokenExpiry) {
    const accessExp = toTimestamp(tokens.accessTokenExpiry);
    if (accessExp && accessExp <= now) {
      return true;
    }
  }

  return false;
};

export const setTokens = ({
  accessToken,
  accessTokenExpiry,
  refreshToken,
  refreshTokenExpiry,
  user,
  userName,
  company,
  adminId,
  websiteId,
  isSuperAdmin,
  remember = false,
}) => {
  const key = import.meta.env.VITE_TOKEN_KEY || DEFAULT_TOKEN_KEY;

  const resolvedWebsiteId = websiteId ?? user?.websiteId ?? null;
  if (resolvedWebsiteId) {
    try {
      sessionStorage.setItem('af-admin-active-website-id', String(resolvedWebsiteId));
      localStorage.setItem('af-admin-active-website-id', String(resolvedWebsiteId));
    } catch {}
  }

  const value = JSON.stringify({
    accessToken,
    accessTokenExpiry: accessTokenExpiry || Date.now() + 3600 * 1000,
    refreshToken,
    refreshTokenExpiry: refreshTokenExpiry || Date.now() + 7 * 86400 * 1000,
    user: user || null,
    userName: userName || (user && user.userName) || 'admin',
    company: company || 'Admin',
    adminId: adminId ?? user?.adminId ?? null,
    websiteId: resolvedWebsiteId,
    isSuperAdmin: Boolean(isSuperAdmin ?? user?.isSuperAdmin),
    loginAt: Date.now(),
    expiresAt: Date.now() + (remember ? 7 * 86400 * 1000 : 8 * 3600 * 1000),
  });

  try {
    sessionStorage.setItem(key, value);
    localStorage.setItem(key, value);
  } catch (err) {
    console.error('Failed to save tokens', err);
  }
};

export const getTokens = () => {
  const key = import.meta.env.VITE_TOKEN_KEY || DEFAULT_TOKEN_KEY;
  try {
    const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (raw) {
      const tokens = JSON.parse(raw);
      // Auto-purge if expired
      if (isSessionExpired(tokens)) {
        clearTokens();
        return null;
      }
      return tokens;
    }
  } catch (err) {
    console.error('Failed to read tokens', err);
  }
  return null;
};

export const clearTokens = () => {
  const key = import.meta.env.VITE_TOKEN_KEY || DEFAULT_TOKEN_KEY;
  try {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to clear tokens', err);
  }
};
