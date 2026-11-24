// -------------------------------------------------------------------------------------------
// User & Auth Service (CargoJet pattern)
// -------------------------------------------------------------------------------------------

import axios from 'axios';
import Api from '../../app/api';
import AuthMiddleware from '../../middlewares/auth/auth';
import { clearTokens, getTokens, setTokens } from '../../utils/authToken';

const getBaseUrl = () => {
  const url = import.meta.env.VITE_BASE_URL;
  if (url) {
    return url.replace(/\/+$/, '');
  }
  // When empty (default in dev), use relative path so Vite proxy forwards requests and avoids CORS/405
  return '';
};

// -------------------------------------------------------------------------------------------
// 1. Verify User / Login
// API: POST https://api.africafuture.co.za/api/Admin/login
// Payload: { userName, password }
// -------------------------------------------------------------------------------------------
export const verifyUser = async ({ userName, password, company = 'Admin', remember = false }) => {
  try {
    const payload = {
      userName: (userName || '').trim(),
      password: password || '',
    };

    const response = await axios.post(
      `${getBaseUrl()}${Api.Login}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response && (response.status === 200 || response.status === 201)) {
      const data = response.data || {};
      const accessToken =
        data.accessToken || data.token || data.jwt || data.data?.accessToken;
      const refreshToken =
        data.refreshToken || data.data?.refreshToken;
      const accessTokenExpiry =
        data.accessTokenExpiresAt || data.accessTokenExpiry || data.expiresIn;
      const refreshTokenExpiry =
        data.refreshTokenExpiresAt || data.refreshTokenExpiry;

      setTokens({
        accessToken,
        accessTokenExpiry,
        refreshToken,
        refreshTokenExpiry,
        adminId: data.adminId,
        isSuperAdmin: data.isSuperAdmin,
        user: {
          adminId: data.adminId,
          userName: data.userName || payload.userName,
          isSuperAdmin: data.isSuperAdmin,
        },
        userName: data.userName || payload.userName || 'admin',
        company,
        remember,
      });
    }

    return response;
  } catch (error) {
    return error.response || { status: 500, data: { message: error.message || 'Server connection error' } };
  }
};

// -------------------------------------------------------------------------------------------
// 2. Refresh Token
// API: POST https://api.africafuture.co.za/api/Admin/refresh-token
// Payload: { refreshToken }
// -------------------------------------------------------------------------------------------
export const verifyRefreshToken = async (refreshToken) => {
  try {
    const payload = {
      refreshToken: refreshToken || '',
    };

    const response = await axios.post(
      `${getBaseUrl()}${Api.RefreshToken}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response && (response.status === 200 || response.status === 201)) {
      const current = getTokens() || {};
      const data = response.data || {};
      const nextAccess =
        data.accessToken || data.token || data.data?.accessToken || current.accessToken;
      const nextRefresh =
        data.refreshToken || data.data?.refreshToken || current.refreshToken;
      const nextAccessExpiry =
        data.accessTokenExpiresAt || data.accessTokenExpiry || current.accessTokenExpiry;
      const nextRefreshExpiry =
        data.refreshTokenExpiresAt || data.refreshTokenExpiry || current.refreshTokenExpiry;

      setTokens({
        ...current,
        accessToken: nextAccess,
        accessTokenExpiry: nextAccessExpiry,
        refreshToken: nextRefresh,
        refreshTokenExpiry: nextRefreshExpiry,
      });
    }

    return response;
  } catch (error) {
    return error.response || { status: 500, data: { message: error.message } };
  }
};

// -------------------------------------------------------------------------------------------
// 3. Get User Details
// -------------------------------------------------------------------------------------------
export const getUserDetailsAsync = async () => {
  const isAuth = await AuthMiddleware();
  const tokens = getTokens();

  if (isAuth && tokens?.accessToken) {
    try {
      const response = await axios.get(
        `${getBaseUrl()}/api/Admin/me`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return { data: response };
    } catch (error) {
      return { data: error.response };
    }
  }
  return false;
};

// -------------------------------------------------------------------------------------------
// 4. Logout User
// -------------------------------------------------------------------------------------------
export const logoutUser = () => {
  clearTokens();
};
