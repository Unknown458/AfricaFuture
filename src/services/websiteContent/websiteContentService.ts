// -------------------------------------------------------------------------------------------
// Website Content & Media Service (CargoJet Pattern with TypeScript)
// -------------------------------------------------------------------------------------------

import axios, { type AxiosResponse } from 'axios';
import Api from '../../app/api';
import AuthMiddleware from '../../middlewares/auth/auth';
import { getTokens } from '../../utils/authToken';
import { getActiveWebsiteId } from '../../utils/websiteDomain';
import type {
  CreateWebsiteContentDto,
  UpdateWebsiteContentDto,
  AddWebsiteContentMediaDto,
  WebsiteContentApiResponse,
  SaveContentWithMediaParams,
  SaveContentWithMediaResult,
  DeleteContentAndMediaParams,
  DeleteContentAndMediaResult,
} from './websiteContentService.types';

const getBaseUrl = (): string => {
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
 * Normalizes customFields to stringified JSON (defaults to "{}")
 */
export const formatCustomFields = (cf: any): string => {
  if (!cf) return '{}';
  if (typeof cf === 'string') {
    const trimmed = cf.trim();
    if (!trimmed) return '{}';
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return trimmed;
    }
    return JSON.stringify({ value: trimmed });
  }
  if (typeof cf === 'object') {
    return JSON.stringify(cf);
  }
  return '{}';
};

/**
 * Extracts contentId from various backend response shapes
 */
export const extractContentId = (resData: any): number | null => {
  if (!resData) return null;
  const target = resData?.data ?? resData;
  const possibleId =
    target?.contentId ??
    target?.ContentId ??
    target?.id ??
    target?.Id;
  const num = Number(possibleId);
  return !isNaN(num) && num > 0 ? num : null;
};

// -------------------------------------------------------------------------------------------
// 1. Create Website Content
// API: POST /api/WebsiteContent/Create?websiteId={websiteId}
// -------------------------------------------------------------------------------------------
export const createWebsiteContentAsync = async (
  payload: CreateWebsiteContentDto
): Promise<WebsiteContentApiResponse> => {
  const authResponse: boolean = await AuthMiddleware();
  const tokens = getTokens();

  if (authResponse && tokens) {
    try {
      const response = await axios.post(
        `${getBaseUrl()}${Api.WebsiteContentCreate}?websiteId=${payload.websiteId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return {
        data: response,
      };
    } catch (error: any) {
      return {
        data: error.response,
      };
    }
  } else {
    return false;
  }
};

// -------------------------------------------------------------------------------------------
// 2. Get Website Content By ID
// API: GET /api/WebsiteContent/GetById/{contentId}?websiteId={websiteId}
// -------------------------------------------------------------------------------------------
export const getWebsiteContentByIdAsync = async (
  contentId: number,
  websiteId: number
): Promise<WebsiteContentApiResponse> => {
  const authResponse: boolean = await AuthMiddleware();
  const tokens = getTokens();

  if (authResponse && tokens) {
    try {
      const getByIdPath =
        typeof Api.GetWebsiteContentById === 'function'
          ? Api.GetWebsiteContentById(contentId)
          : `/api/WebsiteContent/GetById/${contentId}`;

      const response = await axios.get(
        `${getBaseUrl()}${getByIdPath}?websiteId=${websiteId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return {
        data: response,
      };
    } catch (error: any) {
      return {
        data: error.response,
      };
    }
  } else {
    return false;
  }
};

// -------------------------------------------------------------------------------------------
// 3. Get All Website Contents
// API: GET /api/WebsiteContent/List?websiteId={websiteId}&publishedOnly={publishedOnly}
// -------------------------------------------------------------------------------------------
export const getAllWebsiteContentsAsync = async (
  websiteId: number,
  publishedOnly: boolean = false
): Promise<WebsiteContentApiResponse> => {
  const authResponse: boolean = await AuthMiddleware();
  const tokens = getTokens();

  if (authResponse && tokens) {
    try {
      const response = await axios.get(
        `${getBaseUrl()}${Api.GetAllWebsiteContents}?websiteId=${websiteId}&publishedOnly=${publishedOnly}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return {
        data: response,
      };
    } catch (error: any) {
      return {
        data: error.response,
      };
    }
  } else {
    return false;
  }
};

// -------------------------------------------------------------------------------------------
// 4. Update Website Content
// API: PUT /api/WebsiteContent/Update/{contentId}?websiteId={websiteId}
// -------------------------------------------------------------------------------------------
export const updateWebsiteContentAsync = async (
  contentId: number,
  websiteId: number,
  payload: UpdateWebsiteContentDto
): Promise<WebsiteContentApiResponse> => {
  const authResponse: boolean = await AuthMiddleware();
  const tokens = getTokens();

  if (authResponse && tokens) {
    try {
      const updatePath =
        typeof Api.WebsiteContentUpdate === 'function'
          ? Api.WebsiteContentUpdate(contentId)
          : `/api/WebsiteContent/Update/${contentId}`;

      const response = await axios.put(
        `${getBaseUrl()}${updatePath}?websiteId=${websiteId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return {
        data: response,
      };
    } catch (error: any) {
      return {
        data: error.response,
      };
    }
  } else {
    return false;
  }
};

// -------------------------------------------------------------------------------------------
// 5. Add Website Content Media (Link mediaId to contentId)
// API: POST /api/WebsiteContentMedia/Add?websiteId={websiteId}
// -------------------------------------------------------------------------------------------
export const addWebsiteContentMediaAsync = async (
  payload: AddWebsiteContentMediaDto,
  websiteId: number
): Promise<WebsiteContentApiResponse> => {
  const authResponse: boolean = await AuthMiddleware();
  const tokens = getTokens();

  if (authResponse && tokens) {
    try {
      const response = await axios.post(
        `${getBaseUrl()}${Api.WebsiteContentMediaAdd}?websiteId=${websiteId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return {
        data: response,
      };
    } catch (error: any) {
      return {
        data: error.response,
      };
    }
  } else {
    return false;
  }
};

// -------------------------------------------------------------------------------------------
// 6. Get All Website Content Media
// API: GET /api/WebsiteContentMedia/List?contentId={contentId}&websiteId={websiteId}
// -------------------------------------------------------------------------------------------
export const getAllWebsiteContentMediaAsync = async (
  contentId: number,
  websiteId: number
): Promise<WebsiteContentApiResponse> => {
  const authResponse: boolean = await AuthMiddleware();
  const tokens = getTokens();

  if (authResponse && tokens) {
    try {
      const response = await axios.get(
        `${getBaseUrl()}${Api.GetAllWebsiteContentMedia}?contentId=${contentId}&websiteId=${websiteId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return {
        data: response,
      };
    } catch (error: any) {
      return {
        data: error.response,
      };
    }
  } else {
    return false;
  }
};

// -------------------------------------------------------------------------------------------
// 7. Delete Website Content Media (Remove connection between media and content)
// API: DELETE /api/WebsiteContentMedia/Remove?contentMediaId={contentMediaId}&contentId={contentId}&websiteId={websiteId}
// -------------------------------------------------------------------------------------------
export const deleteWebsiteContentMediaAsync = async (
  contentMediaId: number,
  contentId: number,
  websiteId: number
): Promise<WebsiteContentApiResponse> => {
  const authResponse: boolean = await AuthMiddleware();
  const tokens = getTokens();

  if (authResponse && tokens) {
    try {
      const response = await axios.delete(
        `${getBaseUrl()}${Api.DeleteWebsiteContentMedia}`,
        {
          params: {
            contentMediaId,
            contentId,
            websiteId,
          },
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return {
        data: response,
      };
    } catch (error: any) {
      return {
        data: error.response,
      };
    }
  } else {
    return false;
  }
};

// -------------------------------------------------------------------------------------------
// 8. Delete Media Permanently
// API: DELETE /api/Media/DeletePermanently/{mediaId}?websiteId={websiteId}
// -------------------------------------------------------------------------------------------
export const deletePermanentlyMediaAsync = async (
  mediaId: number,
  websiteId: number
): Promise<WebsiteContentApiResponse> => {
  const authResponse: boolean = await AuthMiddleware();
  const tokens = getTokens();

  if (authResponse && tokens) {
    try {
      const response = await axios.delete(
        `${getBaseUrl()}${Api.DeletePermanentlyMedia}/${mediaId}?websiteId=${websiteId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return {
        data: response,
      };
    } catch (error: any) {
      return {
        data: error.response,
      };
    }
  } else {
    return false;
  }
};

// -------------------------------------------------------------------------------------------
// 9. Publish Website Content
// API: PUT /api/WebsiteContent/Publish/{contentId}?isPublished=true&websiteId={websiteId}
// -------------------------------------------------------------------------------------------
export const publishWebsiteContentAsync = async (
  contentId: number,
  websiteId: number,
  isPublished: boolean = true
): Promise<WebsiteContentApiResponse> => {
  const authResponse: boolean = await AuthMiddleware();
  const tokens = getTokens();

  if (authResponse && tokens) {
    try {
      const publishPath =
        typeof Api.WebsiteContentPublish === 'function'
          ? Api.WebsiteContentPublish(contentId)
          : `/api/WebsiteContent/Publish/${contentId}`;

      const response = await axios.put(
        `${getBaseUrl()}${publishPath}?isPublished=${isPublished}&websiteId=${websiteId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return {
        data: response,
      };
    } catch (error: any) {
      return {
        data: error.response,
      };
    }
  } else {
    return false;
  }
};

// -------------------------------------------------------------------------------------------
// 10. Combined Save / Update & Link & Publish Orchestrator Flow
// -------------------------------------------------------------------------------------------
export const saveContentWithMediaFlow = async ({
  websiteId,
  mediaId,
  contentId: existingContentId,
  contentMediaId: existingContentMediaId,
  contentData,
  mediaData,
  publishImmediately = false,
  onProgressStatus,
}: SaveContentWithMediaParams): Promise<SaveContentWithMediaResult> => {
  const dynamicWebsiteId =
    websiteId ||
    contentData?.websiteId ||
    getActiveWebsiteId();

  if (!dynamicWebsiteId) {
    return {
      success: false,
      message: 'Dynamic websiteId is required. Please select or provide a website context.',
    };
  }

  const isUpdating = Boolean(existingContentId && existingContentId > 0);

  // Exact payload: same fields for both CREATE and UPDATE
  // isPublished in contentData takes precedence (reflects form toggle);
  // fallback to publishImmediately for new creates where contentData.isPublished is not set
  const payloadIsPublished =
    contentData.isPublished !== undefined ? contentData.isPublished : Boolean(publishImmediately);

  const contentPayload: CreateWebsiteContentDto = {
    category: contentData.category || '',
    contentId: isUpdating ? Number(existingContentId) : 0,
    contentType: contentData.contentType || 'Product',
    currency: contentData.currency || 'ZAR',
    customFields: formatCustomFields(contentData.customFields),
    description: contentData.description || '',
    displayOrder: Number(contentData.displayOrder || 0),
    isActive: contentData.isActive !== false,
    isPublished: payloadIsPublished,
    price: Number(contentData.price || 0),
    shortDescription: contentData.shortDescription || '',
    title: contentData.title || '',
    warranty: contentData.warranty || '',
    websiteId: Number(dynamicWebsiteId),
  };

  let activeContentId: number | null = existingContentId || null;
  let contentRes: WebsiteContentApiResponse | null = null;

  if (isUpdating && existingContentId) {
    // Call UPDATE API: PUT /api/WebsiteContent/Update/{contentId}?websiteId={websiteId}
    if (onProgressStatus) onProgressStatus('Updating website content… (1/3)');
    contentRes = await updateWebsiteContentAsync(existingContentId, dynamicWebsiteId, contentPayload);
  } else {
    // Call CREATE API: POST /api/WebsiteContent/Create?websiteId={websiteId}
    if (onProgressStatus) onProgressStatus('Creating website content… (1/3)');
    contentRes = await createWebsiteContentAsync(contentPayload);
  }

  if (!contentRes || typeof contentRes === 'boolean' || !contentRes.data) {
    return {
      success: false,
      step: isUpdating ? 'updateContent' : 'createContent',
      message: 'Authentication failed or server unreachable while saving content.',
    };
  }

  const contentStatus = contentRes.data.status;
  if (contentStatus !== 200 && contentStatus !== 201 && contentStatus !== 204) {
    const errorMsg =
      contentRes.data.data?.message ||
      contentRes.data.data?.title ||
      `Failed at Step 1: ${isUpdating ? 'Updating' : 'Creating'} website content`;
    return {
      success: false,
      step: isUpdating ? 'updateContent' : 'createContent',
      message: errorMsg,
      contentResponse: contentRes.data,
    };
  }

  if (!isUpdating) {
    activeContentId = extractContentId(contentRes.data.data);
  }

  // Step 2: Link Media — CREATE only.
  // On UPDATE the media link already exists, so we keep the existing IDs
  // and never call WebsiteContentMedia/Add.
  let mediaLinkRes: WebsiteContentApiResponse | null = null;
  if (!isUpdating && activeContentId && (!existingContentMediaId || existingContentMediaId <= 0)) {
    if (onProgressStatus) onProgressStatus('Linking media to content… (2/3)');
    const mediaPayload: AddWebsiteContentMediaDto = {
      contentMediaId: 0,
      contentId: Number(activeContentId),
      mediaId: Number(mediaId),
      isPrimary: mediaData?.isPrimary !== false,
      imageDescription: mediaData?.imageDescription || contentPayload.description || contentPayload.title,
      altText: mediaData?.altText || contentPayload.title,
      displayOrder: Number(mediaData?.displayOrder || 0),
    };

    mediaLinkRes = await addWebsiteContentMediaAsync(mediaPayload, dynamicWebsiteId);

    if (!mediaLinkRes || typeof mediaLinkRes === 'boolean' || !mediaLinkRes.data) {
      return {
        success: false,
        step: 'addMedia',
        contentId: activeContentId || undefined,
        message: 'Authentication failed or server unreachable while linking media.',
      };
    }

    const mediaStatus = mediaLinkRes.data.status;
    if (mediaStatus !== 200 && mediaStatus !== 201) {
      const errorMsg =
        mediaLinkRes.data.data?.message ||
        mediaLinkRes.data.data?.title ||
        'Failed at Step 2: Linking media to website content';
      return {
        success: false,
        step: 'addMedia',
        contentId: activeContentId || undefined,
        message: errorMsg,
        mediaResponse: mediaLinkRes.data,
      };
    }
  }

  // Step 3: Publish Content (only if publishImmediately is true)
  let publishRes: WebsiteContentApiResponse | null = null;
  if (publishImmediately && activeContentId) {
    if (onProgressStatus) onProgressStatus('Publishing content live… (3/3)');
    publishRes = await publishWebsiteContentAsync(activeContentId, dynamicWebsiteId, true);

    if (
      !publishRes ||
      typeof publishRes === 'boolean' ||
      !publishRes.data ||
      (publishRes.data.status !== 200 && publishRes.data.status !== 204)
    ) {
      const errorMsg =
        (publishRes && typeof publishRes !== 'boolean' && publishRes.data?.data?.message) ||
        'Content saved, but publishing failed.';
      return {
        success: false,
        step: 'publish',
        contentId: activeContentId,
        message: errorMsg,
        publishResponse: publishRes && typeof publishRes !== 'boolean' ? publishRes.data : undefined,
      };
    }
  }

  if (onProgressStatus) onProgressStatus('Completed successfully!');

  return {
    success: true,
    contentId: activeContentId || undefined,
    websiteId: dynamicWebsiteId,
    isPublished: Boolean(publishImmediately),
    contentResponse: contentRes.data.data,
    mediaResponse: mediaLinkRes && typeof mediaLinkRes !== 'boolean' ? mediaLinkRes.data.data : undefined,
    publishResponse: publishRes && typeof publishRes !== 'boolean' ? publishRes.data?.data : undefined,
  };
};

// -------------------------------------------------------------------------------------------
// 11. Composite Delete Flow
// Step A: If contentMediaId exists: DELETE /api/WebsiteContentMedia/Remove (remove content-media link)
// Step B: DELETE /api/Media/DeletePermanently/{mediaId}?websiteId={websiteId} (permanently delete the media)
// -------------------------------------------------------------------------------------------
export const deleteContentAndMediaFlow = async ({
  mediaId,
  contentId,
  contentMediaId,
  websiteId,
}: DeleteContentAndMediaParams): Promise<DeleteContentAndMediaResult> => {
  const dynamicWebsiteId = websiteId || getActiveWebsiteId();
  if (!dynamicWebsiteId) {
    return {
      success: false,
      message: 'Website ID is required for deletion.',
    };
  }

  let mediaLinkDeleteSuccess = false;
  let mediaDeleteSuccess = false;

  // Step A: Delete website content media connection if exists
  if (contentMediaId && contentMediaId > 0 && contentId && contentId > 0) {
    try {
      const linkRes = await deleteWebsiteContentMediaAsync(
        contentMediaId,
        contentId,
        dynamicWebsiteId
      );
      if (linkRes && typeof linkRes !== 'boolean' && (linkRes.data.status === 200 || linkRes.data.status === 204)) {
        mediaLinkDeleteSuccess = true;
      }
    } catch (err) {
      console.warn('Notice: removing content-media link failed:', err);
    }
  }

  // Step B: Delete media permanently
  if (mediaId && mediaId > 0) {
    try {
      const permRes = await deletePermanentlyMediaAsync(mediaId, dynamicWebsiteId);
      if (permRes && typeof permRes !== 'boolean' && (permRes.data.status === 200 || permRes.data.status === 204)) {
        mediaDeleteSuccess = true;
      } else {
        const errorMsg =
          (permRes && typeof permRes !== 'boolean' && (permRes.data?.data?.message || permRes.data?.data?.title)) ||
          'Failed to permanently delete media.';
        return {
          success: false,
          message: errorMsg,
          mediaLinkDeleteSuccess,
          mediaDeleteSuccess: false,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Error occurred while permanently deleting media.',
        mediaLinkDeleteSuccess,
        mediaDeleteSuccess: false,
      };
    }
  }

  return {
    success: true,
    mediaDeleteSuccess,
    mediaLinkDeleteSuccess,
    message: 'Media and associated links permanently deleted successfully.',
  };
};

// Aliases for backwards compatibility
export const createWebsiteContent = createWebsiteContentAsync;
export const getWebsiteContentById = getWebsiteContentByIdAsync;
export const getAllWebsiteContents = getAllWebsiteContentsAsync;
export const updateWebsiteContent = updateWebsiteContentAsync;
export const addWebsiteContentMedia = addWebsiteContentMediaAsync;
export const getAllWebsiteContentMedia = getAllWebsiteContentMediaAsync;
export const deleteWebsiteContentMedia = deleteWebsiteContentMediaAsync;
export const deletePermanentlyMedia = deletePermanentlyMediaAsync;
export const publishWebsiteContent = publishWebsiteContentAsync;

export default {
  createWebsiteContentAsync,
  getWebsiteContentByIdAsync,
  getAllWebsiteContentsAsync,
  updateWebsiteContentAsync,
  addWebsiteContentMediaAsync,
  getAllWebsiteContentMediaAsync,
  deleteWebsiteContentMediaAsync,
  deletePermanentlyMediaAsync,
  publishWebsiteContentAsync,
  saveContentWithMediaFlow,
  deleteContentAndMediaFlow,
};
