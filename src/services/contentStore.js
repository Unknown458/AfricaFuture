/**
 * Target Website Content Store (Design / UI Mode)
 * --------------------------------------------------------------
 * The Admin Panel manages content for the client's target website
 * (not the main AfricaFuture landing page).
 *
 * API Integration (currently left empty for UI design):
 *   Set `API_BASE_URL` and replace the storage calls below with
 *   `fetch(...)` requests to your target website's backend API.
 */

import Api, { BASE_URL } from '../app/api';

export const API_BASE_URL = BASE_URL;

export const API_ENDPOINTS = {
  gallery: BASE_URL ? `${BASE_URL}${Api.Gallery}` : '',
  promotions: BASE_URL ? `${BASE_URL}${Api.Promotions}` : '',
  siteImages: BASE_URL ? `${BASE_URL}${Api.SiteImages}` : '',
};

const DB_NAME = 'africafuture-cms';
const DB_VERSION = 1;
const STORES = ['gallery', 'promotions', 'kv'];
const CHANGE_EVENT = 'af-content-updated';

let dbPromise = null;
const channel =
  typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('africafuture-cms')
    : null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      STORES.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx(storeName, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    const result = fn(store);
    t.oncomplete = () => resolve(result?.result ?? result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

function notifyChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
  channel?.postMessage('changed');
}

export function subscribe(callback) {
  const onMsg = () => callback();
  window.addEventListener(CHANGE_EVENT, callback);
  channel?.addEventListener('message', onMsg);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    channel?.removeEventListener('message', onMsg);
  };
}

export function createId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/* ---------------- Generic collection helpers ---------------- */

async function getAll(storeName) {
  const items = await tx(storeName, 'readonly', (s) => s.getAll());
  return (items || []).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || (b.createdAt ?? 0) - (a.createdAt ?? 0)
  );
}

async function putItem(storeName, item) {
  const now = Date.now();
  const record = {
    ...item,
    id: item.id || createId(storeName),
    createdAt: item.createdAt || now,
    updatedAt: now,
  };
  await tx(storeName, 'readwrite', (s) => s.put(record));
  notifyChange();
  return record;
}

async function removeItem(storeName, id) {
  await tx(storeName, 'readwrite', (s) => s.delete(id));
  notifyChange();
}

/* ---------------- Gallery ---------------- */

export const getGallery = () => getAll('gallery');
export const saveGalleryItem = (item) => putItem('gallery', item);
export const deleteGalleryItem = (id) => removeItem('gallery', id);

/* ---------------- Promotions ---------------- */

export const getPromotions = () => getAll('promotions');
export const savePromotion = (item) => putItem('promotions', item);
export const deletePromotion = (id) => removeItem('promotions', id);

export function getPromotionStatus(promo, now = new Date()) {
  if (!promo.active) return 'draft';
  const start = promo.startDate ? new Date(`${promo.startDate}T00:00:00`) : null;
  const end = promo.endDate ? new Date(`${promo.endDate}T23:59:59`) : null;
  if (start && now < start) return 'scheduled';
  if (end && now > end) return 'expired';
  return 'live';
}

/* ---------------- Site image overrides ---------------- */

export async function getSiteImages() {
  const rec = await tx('kv', 'readonly', (s) => s.get('siteImages'));
  return rec?.value || {};
}

export async function setSiteImage(slot, dataUrl) {
  const current = await getSiteImages();
  const value = { ...current };
  if (dataUrl) value[slot] = dataUrl;
  else delete value[slot];
  await tx('kv', 'readwrite', (s) => s.put({ id: 'siteImages', value }));
  notifyChange();
}

/* ---------------- Backup / restore ---------------- */

export async function exportAll() {
  const [gallery, promotions, siteImages] = await Promise.all([
    getGallery(),
    getPromotions(),
    getSiteImages(),
  ]);
  return {
    app: 'africafuture-cms',
    version: 1,
    exportedAt: new Date().toISOString(),
    gallery,
    promotions,
    siteImages,
  };
}

export async function importAll(data) {
  if (!data || data.app !== 'africafuture-cms') {
    throw new Error('This file is not a valid AfricaFuture backup.');
  }
  await clearAll(false);
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const t = db.transaction(STORES, 'readwrite');
    (data.gallery || []).forEach((g) => t.objectStore('gallery').put(g));
    (data.promotions || []).forEach((p) => t.objectStore('promotions').put(p));
    t.objectStore('kv').put({ id: 'siteImages', value: data.siteImages || {} });
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error);
  });
  notifyChange();
}

export async function clearAll(notify = true) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const t = db.transaction(STORES, 'readwrite');
    STORES.forEach((name) => t.objectStore(name).clear());
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error);
  });
  if (notify) notifyChange();
}

/* ---------------- Media processing (Images & Videos) ---------------- */

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
];

export const ACCEPTED_MEDIA_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
];

export const MAX_UPLOAD_MB = 15;
export const MAX_VIDEO_MB = 100;

/**
 * Validates, resizes and compresses an image file in the browser.
 * Returns a data URL ready for storage/display.
 */
export function processImage(file, { maxSize = 1600, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error(`${file.name}: only JPG, PNG, WEBP or GIF images are allowed.`));
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      reject(new Error(`${file.name}: file is larger than ${MAX_UPLOAD_MB}MB.`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`${file.name}: could not be read.`));
    reader.onload = () => {
      // Keep GIFs untouched so animations survive
      if (file.type === 'image/gif') {
        resolve(reader.result);
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error(`${file.name}: invalid image.`));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const type = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
        resolve(canvas.toDataURL(type, quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a video file and generates a poster thumbnail frame.
 */
export function processVideo(file) {
  return new Promise((resolve, reject) => {
    const isVideo =
      file.type.startsWith('video/') ||
      /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);

    if (!isVideo) {
      reject(new Error(`${file.name}: only MP4, WEBM, MOV or OGG videos are allowed.`));
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      reject(new Error(`${file.name}: video is larger than ${MAX_VIDEO_MB}MB.`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`${file.name}: could not be read.`));
    reader.onload = () => {
      const dataUrl = reader.result;

      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = dataUrl;
        video.muted = true;
        video.playsInline = true;
        video.currentTime = 0.5;

        let resolved = false;
        const done = (poster = null, duration = null) => {
          if (resolved) return;
          resolved = true;
          resolve({
            src: dataUrl,
            poster,
            type: 'video',
            mimeType: file.type || 'video/mp4',
            duration,
          });
        };

        const timer = setTimeout(() => done(null), 3500);

        video.onloadeddata = () => {
          clearTimeout(timer);
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(video.videoWidth || 640, 640);
            const ratio = (video.videoHeight || 360) / (video.videoWidth || 640);
            canvas.height = Math.round(canvas.width * (ratio || 0.5625));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const poster = canvas.toDataURL('image/jpeg', 0.82);
            done(poster, video.duration || null);
          } catch {
            done(null, video.duration || null);
          }
        };

        video.onerror = () => {
          clearTimeout(timer);
          done(null);
        };
      } catch {
        resolve({
          src: dataUrl,
          poster: null,
          type: 'video',
          mimeType: file.type || 'video/mp4',
          duration: null,
        });
      }
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Universal media processor: automatically detects image vs video.
 */
export async function processMedia(file, options = {}) {
  const isVideo =
    file.type?.startsWith('video/') ||
    /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);

  if (isVideo) {
    return processVideo(file);
  }

  const src = await processImage(file, options);
  return {
    src,
    poster: null,
    type: 'image',
    mimeType: file.type || 'image/jpeg',
  };
}

export function dataUrlSizeKb(dataUrl = '') {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.round((base64.length * 3) / 4 / 1024);
}
