import { useCallback, useEffect, useState } from 'react';
import {
  getGallery,
  getPromotions,
  getSiteImages,
  subscribe,
} from '../services/contentStore';

/**
 * Loads all admin-managed content and keeps it in sync whenever the
 * admin panel saves changes (same tab or other tabs).
 */
export function useSiteContent() {
  const [state, setState] = useState({
    gallery: [],
    promotions: [],
    siteImages: {},
    loaded: false,
  });

  const load = useCallback(async () => {
    try {
      const [gallery, promotions, siteImages] = await Promise.all([
        getGallery(),
        getPromotions(),
        getSiteImages(),
      ]);
      setState({ gallery, promotions, siteImages, loaded: true });
    } catch (err) {
      console.error('Failed to load site content', err);
      setState((s) => ({ ...s, loaded: true }));
    }
  }, []);

  useEffect(() => {
    load();
    return subscribe(load);
  }, [load]);

  return { ...state, reload: load };
}
