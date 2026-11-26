// -------------------------------------------------------------------------------------------
// Media Service (Upload & Media Management)
// -------------------------------------------------------------------------------------------

import axios from 'axios';
import Api from '../../app/api';
import AuthMiddleware from '../../middlewares/auth/auth';
import { getTokens } from '../../utils/authToken';
import { getActiveWebsiteId, getWebsiteDomain } from '../../utils/websiteDomain';

const getBaseUrl = () => {
  // In local dev, use empty string so requests go through Vite proxy (/api -> https://api.africafuture.co.za)
  // This avoids browser CORS block (Preflight OPTIONS missing Access-Control-Allow-Origin)
  if (import.meta.env.DEV) {
    return '';
  }
  const url =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'https://api.africafuture.co.za';
  return url.replace(/\/+$/, '');
};

/**
 * Uploads media file to POST /api/Media/Upload using multipart/form-data
 * Parameters:
 * - file: File ($binary)
 * - mediaDetails: string (optional details/caption/title)
 * - displayOrder: number (integer $int32)
 * - websiteId: number (integer $int32)
 * - onProgress: function callback(percent: number)
 */
export const uploadMediaApi = async ({
  file,
  mediaDetails = '',
  displayOrder = 0,
  websiteId,
  onProgress,
}) => {
  try {
    await AuthMiddleware();
    const tokens = getTokens();

    const dynamicWebsiteId = websiteId || getActiveWebsiteId();
    if (!dynamicWebsiteId) {
      return {
        success: false,
        message: 'Dynamic websiteId is required for media upload. Please select a website context.',
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaDetails', mediaDetails || '');
    formData.append('displayOrder', String(displayOrder ?? 0));
    formData.append('websiteId', String(dynamicWebsiteId));

    const headers = {
      ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
      // Note: Do not set Content-Type header manually; axios/browser automatically
      // includes multipart/form-data with the correct boundary parameter.
    };

    const response = await axios.post(
      `${getBaseUrl()}${Api.MediaUpload}`,
      formData,
      {
        headers,
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            onProgress(percent);
          }
        },
      }
    );

    return {
      success: response.status === 200 || response.status === 201,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error('Failed to upload media:', error);
    const serverMsg =
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.response?.data?.error ||
      error.message ||
      'Upload failed';

    return {
      success: false,
      message: serverMsg,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

/**
 * Resolves relative or server file paths to full usable URLs.
 * Checks websiteId to prepend the correct website domain (websiteId 1 = https://www.meemcurtain.co.za).
 */
export const resolveMediaUrl = (urlOrPath, websiteId) => {
  if (!urlOrPath) return '';
  if (
    urlOrPath.startsWith('http://') ||
    urlOrPath.startsWith('https://') ||
    urlOrPath.startsWith('data:') ||
    urlOrPath.startsWith('blob:')
  ) {
    return urlOrPath;
  }
  const base = getWebsiteDomain(websiteId);
  const clean = urlOrPath.replace(/^[\\/]+/, '').replace(/\\/g, '/');
  return `${base}/${clean}`;
};

/**
 * Maps raw backend media item from GET /api/Media/List to the gallery schema.
 */
export const mapApiMediaItem = (item) => {
  if (!item) return null;

  const isVideo =
    item.mediaType === 2 ||
    item.isVideo === true ||
    /\.(mp4|webm|mov|ogg|m4v)$/i.test(
      item.mediaName || item.mediaPath || item.fileUrl || item.filePath || item.fileName || item.mediaDetails || ''
    );

  let rawUrl =
    item.mediaPath ||
    item.mediaName ||
    item.fileUrl ||
    item.filePath ||
    item.url ||
    item.path ||
    '';

  // If rawUrl is just a file name (e.g. "xxx.jpeg"), put /images/ or /videos/ in front
  if (
    rawUrl &&
    !rawUrl.startsWith('http://') &&
    !rawUrl.startsWith('https://') &&
    !rawUrl.startsWith('data:') &&
    !rawUrl.startsWith('blob:')
  ) {
    if (!rawUrl.includes('/')) {
      rawUrl = isVideo ? `/videos/${rawUrl}` : `/images/${rawUrl}`;
    }
  }

  // Prepend website domain based on websiteId (websiteId 1 -> https://www.meemcurtain.co.za)
  const src = resolveMediaUrl(rawUrl, item.websiteId);
  const primaryLinked = item.linkedContents && item.linkedContents.length > 0 ? item.linkedContents[0] : null;

  return {
    id: String(item.mediaId || item.id || `media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
    mediaId: item.mediaId || item.id,
    contentId: primaryLinked?.contentId || item.contentId || null,
    contentMediaId: primaryLinked?.contentMediaId || item.contentMediaId || null,
    linkedContents: item.linkedContents || [],
    src,
    poster: item.thumbnailUrl ? resolveMediaUrl(item.thumbnailUrl, item.websiteId) : null,
    type: isVideo ? 'video' : 'image',
    title:
      primaryLinked?.contentTitle ||
      item.title ||
      item.mediaDetails ||
      (item.mediaName ? item.mediaName.replace(/\.[^.]+$/, '') : '') ||
      (item.fileName ? item.fileName.replace(/\.[^.]+$/, '') : 'Media Item'),
    caption: primaryLinked?.imageDescription || item.caption || item.mediaDetails || '',
    category: primaryLinked?.category || item.category || (isVideo ? 'Videos' : 'Products'),
    visible: item.isActive !== false,
    order: item.displayOrder ?? 0,
    websiteId: item.websiteId,
    createdAt: item.uploadedAt || item.createdAt || Date.now(),
  };
};

/**
 * Fetches uploaded media list from GET /api/Media/List
 * Parameters:
 * - websiteId: number (integer $int32)
 * - mediaType: optional number (integer $int32)
 */
export const getMediaListApi = async ({ websiteId, mediaType } = {}) => {
  try {
    await AuthMiddleware();
    const tokens = getTokens();

    const params = {};
    if (websiteId !== undefined && websiteId !== null && websiteId !== '') {
      params.websiteId = Number(websiteId);
    }
    if (mediaType !== undefined && mediaType !== null && mediaType !== '') {
      params.mediaType = Number(mediaType);
    }

    const headers = {
      ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
    };

    const response = await axios.get(`${getBaseUrl()}${Api.MediaList}`, {
      headers,
      params,
    });

    const rawList =
      response.data?.data ||
      (Array.isArray(response.data) ? response.data : []);

    return {
      success: response.status === 200,
      data: Array.isArray(rawList) ? rawList : [],
      raw: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error('Failed to get media list:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch media list',
      data: [],
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export default {
  uploadMediaApi,
  getMediaListApi,
  resolveMediaUrl,
  mapApiMediaItem,
};
