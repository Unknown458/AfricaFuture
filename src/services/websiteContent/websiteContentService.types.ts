import type { AxiosResponse } from 'axios';

/**
 * Exact payload sent to POST /api/WebsiteContent/Create?websiteId={websiteId}
 * and PUT /api/WebsiteContent/Update/{contentId}?websiteId={websiteId}
 */
export interface CreateWebsiteContentDto {
  category: string;
  contentId: number;
  contentType: string;
  currency: string;
  customFields: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  isPublished: boolean;
  price: number;
  shortDescription: string;
  title: string;
  warranty: string;
  websiteId: number;
}

export type UpdateWebsiteContentDto = CreateWebsiteContentDto;

/**
 * Payload sent to POST /api/WebsiteContentMedia/Add?websiteId={websiteId}
 */
export interface AddWebsiteContentMediaDto {
  contentMediaId: number;
  contentId: number;
  mediaId: number;
  isPrimary: boolean;
  imageDescription: string;
  altText: string;
  displayOrder: number;
}

/**
 * Standard CargoJet API response wrapper: Promise<{ data: AxiosResponse } | boolean>
 */
export type WebsiteContentApiResponse<T = any> =
  | { data: AxiosResponse<T> }
  | boolean;

/**
 * Linked content structure returned in GET /api/Media/List
 */
export interface LinkedContentItem {
  contentId: number;
  contentMediaId: number;
  contentTitle?: string;
  category?: string;
  imageDescription?: string;
  altText?: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

/**
 * Parameters for the orchestrator save/update workflow
 */
export interface SaveContentWithMediaParams {
  websiteId: number;
  mediaId: number;
  contentId?: number;
  contentMediaId?: number;
  contentData: {
    category?: string;
    contentType?: string;
    currency?: string;
    customFields?: string | object;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
    isPublished?: boolean;
    price?: number;
    shortDescription?: string;
    title: string;
    warranty?: string;
    websiteId?: number;
  };
  mediaData?: {
    imageDescription?: string;
    altText?: string;
    isPrimary?: boolean;
    displayOrder?: number;
  };
  publishImmediately?: boolean;
  onProgressStatus?: (status: string) => void;
}

export interface SaveContentWithMediaResult {
  success: boolean;
  contentId?: number;
  contentMediaId?: number;
  websiteId?: number;
  isPublished?: boolean;
  message?: string;
  step?: string;
  error?: any;
  contentResponse?: any;
  mediaResponse?: any;
  publishResponse?: any;
}

/**
 * Parameters for the composite delete flow
 */
export interface DeleteContentAndMediaParams {
  mediaId?: number;
  contentId?: number;
  contentMediaId?: number;
  websiteId?: number;
}

export interface DeleteContentAndMediaResult {
  success: boolean;
  message?: string;
  mediaDeleteSuccess?: boolean;
  mediaLinkDeleteSuccess?: boolean;
}
