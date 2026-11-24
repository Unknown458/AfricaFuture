// -------------------------------------------------------------------------------------------
// API Endpoint Definitions (CargoJet style)
// -------------------------------------------------------------------------------------------

export const Api = {
  // Admin Auth APIs
  Login: '/api/Admin/login',
  VerifyUser: '/api/Admin/login',
  RefreshToken: '/api/Admin/refresh-token',
  ChangeCredentials: '/api/Admin/change-password',

  // SuperAdmin & Website APIs
  GetAllWebsites: '/api/Website/GetAllWebsites',
  GetWebsiteAdmins: '/api/Admin/GetWebsiteAdmins',
  CreateWebsiteAdmin: '/api/Admin/create-website-admin',
  UpdateWebsiteAdminStatus: '/api/Admin/UpdateWebsiteAdminStatus',

  // Media & Content APIs
  MediaUpload: '/api/Media/Upload',
  MediaList: '/api/Media/List',
  Upload: '/api/Media/Upload',
  Gallery: '/api/gallery',
  Promotions: '/api/promotions',
  SiteImages: '/api/site-images',
};

export const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://api.africafuture.co.za';

export default Api;
