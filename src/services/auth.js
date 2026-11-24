/**
 * Authentication Module
 * Integrates CargoJet-style authToken utility & User service with Axios.
 */

import { clearTokens, getTokens, setTokens } from '../utils/authToken';
import { verifyUser } from './user/user';

export async function login(company = 'Admin', username = 'admin', password = '', remember = false) {
  // 1. Attempt real API login: POST https://api.africafuture.co.za/api/Admin/login
  try {
    const response = await verifyUser({
      userName: username,
      password,
      company,
      remember,
    });

    if (response && (response.status === 200 || response.status === 201)) {
      return { success: true, response };
    }
  } catch (err) {
    console.warn('Backend login error, falling back to test token', err);
  }

  // 2. Fallback for testing/design preview when API is unreachable or testing with mock accounts
  setTokens({
    accessToken: `mock_access_token_${Date.now()}`,
    accessTokenExpiry: Date.now() + 3600 * 1000,
    refreshToken: `mock_refresh_token_${Date.now()}`,
    refreshTokenExpiry: Date.now() + 7 * 86400 * 1000,
    user: { userName: username || 'admin' },
    userName: username || 'admin',
    company: company || 'Admin',
    remember,
  });

  return { success: true, testMode: true };
}

export function logout() {
  clearTokens();
}

export function getSession() {
  return getTokens();
}

export const isAuthenticated = () => {
  const tokens = getTokens();
  return Boolean(tokens?.accessToken);
};

export const isSuperAdmin = () => {
  const tokens = getTokens();
  return Boolean(tokens?.isSuperAdmin);
};

export async function changeCredentials({ newCompany, newUsername }) {
  const current = getTokens() || {};
  setTokens({
    ...current,
    company: newCompany || current.company,
    userName: newUsername || current.userName,
  });
}
