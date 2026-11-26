// -------------------------------------------------------------------------------------------
// Auth Middleware (CargoJet pattern)
// -------------------------------------------------------------------------------------------

import { verifyRefreshToken } from '../../services/user/user';
import { clearTokens, getTokens, toTimestamp } from '../../utils/authToken';

let refreshPromise = null; // Deduplicate concurrent refresh requests

export const AuthMiddleware = async () => {
  const expiryThreshold = Number(
    import.meta.env.VITE_ACCESS_TOKEN_REFRESH_THRESHOLD_SECONDS || 30
  );
  const now = Date.now();
  const refreshWindow = now + expiryThreshold * 1000;

  const tokens = getTokens();
  if (!tokens || !tokens.accessToken) {
    clearTokens();
    return false;
  }

  const { accessTokenExpiry, refreshToken, refreshTokenExpiry } = tokens;

  // 1. Check if Refresh Token is expired
  if (refreshTokenExpiry) {
    const refreshExpTime = toTimestamp(refreshTokenExpiry);
    if (refreshExpTime && refreshExpTime <= now) {
      clearTokens();
      return false;
    }
  }

  // 2. Check if Access Token is about to expire or has already expired
  const accessExpTime = toTimestamp(accessTokenExpiry);

  if (accessExpTime && accessExpTime <= refreshWindow) {
    if (!refreshToken) {
      clearTokens();
      return false;
    }

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const response = await verifyRefreshToken(refreshToken);
          const ok = response && (response.status === 200 || response.status === 201);
          if (!ok) {
            clearTokens();
            return false;
          }
          return true;
        } catch (err) {
          console.error('Token refresh failed:', err);
          clearTokens();
          return false;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    return refreshPromise;
  }

  return true;
};

export default AuthMiddleware;
