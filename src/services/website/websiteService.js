// -------------------------------------------------------------------------------------------
// Website & SuperAdmin Management Service (CargoJet pattern)
// -------------------------------------------------------------------------------------------

import axios from 'axios';
import Api from '../../app/api';
import AuthMiddleware from '../../middlewares/auth/auth';
import { getTokens } from '../../utils/authToken';

const getBaseUrl = () => {
  const url = import.meta.env.VITE_BASE_URL;
  if (url) {
    return url.replace(/\/+$/, '');
  }
  return '';
};

const getAuthHeaders = async () => {
  await AuthMiddleware();
  const tokens = getTokens();
  return {
    'Content-Type': 'application/json',
    ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
  };
};

// -------------------------------------------------------------------------------------------
// 1. Get All Websites (SuperAdmin only)
// API: GET /api/Website/GetAllWebsites
// -------------------------------------------------------------------------------------------
export const getAllWebsites = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${getBaseUrl()}${Api.GetAllWebsites}`, { headers });
    return response.data || { success: false, data: [] };
  } catch (error) {
    console.error('Failed to get all websites:', error);
    return error.response?.data || { success: false, message: error.message, data: [] };
  }
};

// -------------------------------------------------------------------------------------------
// 2. Get Website Admins by websiteId
// API: GET /api/Admin/GetWebsiteAdmins?websiteId=1
// -------------------------------------------------------------------------------------------
export const getWebsiteAdmins = async (websiteId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${getBaseUrl()}${Api.GetWebsiteAdmins}?websiteId=${websiteId}`,
      { headers }
    );
    return response.data || { success: false, data: [] };
  } catch (error) {
    console.error('Failed to get website admins:', error);
    return error.response?.data || { success: false, message: error.message, data: [] };
  }
};

// -------------------------------------------------------------------------------------------
// 3. Create Website Admin
// API: POST /api/Admin/create-website-admin
// Payload: { websiteId, userName, password }
// -------------------------------------------------------------------------------------------
export const createWebsiteAdmin = async ({ websiteId, userName, password }) => {
  try {
    const headers = await getAuthHeaders();
    const payload = {
      websiteId: Number(websiteId),
      userName: (userName || '').trim(),
      password: (password || '').trim(),
    };

    const response = await axios.post(
      `${getBaseUrl()}${Api.CreateWebsiteAdmin}`,
      payload,
      { headers }
    );
    return response.data || { success: response.status === 200 };
  } catch (error) {
    console.error('Failed to create website admin:', error);
    return error.response?.data || { success: false, message: error.message };
  }
};

// -------------------------------------------------------------------------------------------
// 4. Update Website Admin Status
// API: POST /api/Admin/UpdateWebsiteAdminStatus
// Payload: { adminId, isActive }
// -------------------------------------------------------------------------------------------
export const updateWebsiteAdminStatus = async ({ adminId, isActive }) => {
  try {
    const headers = await getAuthHeaders();
    const payload = {
      adminId: Number(adminId),
      isActive: Boolean(isActive),
    };

    const response = await axios.post(
      `${getBaseUrl()}${Api.UpdateWebsiteAdminStatus}`,
      payload,
      { headers }
    );
    return response.data || { success: response.status === 200 };
  } catch (error) {
    console.error('Failed to update website admin status:', error);
    return error.response?.data || { success: false, message: error.message };
  }
};
