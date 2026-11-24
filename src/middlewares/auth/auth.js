// -------------------------------------------------------------------------------------------
// Auth Middleware (CargoJet pattern)
// -------------------------------------------------------------------------------------------

import { verifyRefreshToken } from '../../services/user/user';
import { clearTokens, getTokens } from '../../utils/authToken';

export const AuthMiddleware = async () => {
  const expiryThreshold = Number(
    import.meta.env.VITE_ACCESS_TOKEN_REFRESH_THRESHOLD_SECONDS || 30
  );
  const currentTime = Date.now();
  const beforeExpiry = currentTime + expiryThreshold * 1000;

  const tokens = getTokens();
  if (!tokens || !tokens.accessToken) return false;

  const { accessTokenExpiry, refreshToken, refreshTokenExpiry } = tokens;

  // 1. Check if Refresh Token is expired
  if (refreshTokenExpiry) {
    const refreshExpTime = new Date(refreshTokenExpiry).getTime();
    if (!Number.isNaN(refreshExpTime) && refreshExpTime < currentTime) {
      clearTokens();
      return false;
    }
  }

  // 2. Check if Access Token is about to expire, then auto-refresh
  if (accessTokenExpiry && refreshToken) {
    const accessExpTime = new Date(accessTokenExpiry).getTime();
    if (!Number.isNaN(accessExpTime) && accessExpTime < beforeExpiry) {
      try {
        const response = await verifyRefreshToken(refreshToken);
        return response && (response.status === 200 || response.status === 201);
      } catch (err) {
        console.error('Token refresh failed', err);
        return false;
      }
    }
  }

  return true;
};

export default AuthMiddleware;
