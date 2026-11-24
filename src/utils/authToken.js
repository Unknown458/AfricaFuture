// -------------------------------------------------------------------------------------------
// Auth Token Storage (CargoJet pattern)
// -------------------------------------------------------------------------------------------

const DEFAULT_TOKEN_KEY = 'af_admin_tokens';

export const setTokens = ({
  accessToken,
  accessTokenExpiry,
  refreshToken,
  refreshTokenExpiry,
  user,
  userName,
  company,
  adminId,
  isSuperAdmin,
  remember = false,
}) => {
  const key = import.meta.env.VITE_TOKEN_KEY || DEFAULT_TOKEN_KEY;

  const value = JSON.stringify({
    accessToken,
    accessTokenExpiry: accessTokenExpiry || Date.now() + 3600 * 1000,
    refreshToken,
    refreshTokenExpiry: refreshTokenExpiry || Date.now() + 7 * 86400 * 1000,
    user: user || null,
    userName: userName || (user && user.userName) || 'admin',
    company: company || 'Admin',
    adminId: adminId ?? user?.adminId ?? null,
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
      return JSON.parse(raw);
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
