import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AdminIcon from './AdminIcon';
import { Dropzone, EmptyState, Modal, Switch } from './AdminUI';
import { formatDate } from './formatDate';
import {
  dataUrlSizeKb,
  deleteGalleryItem,
  processMedia,
  saveGalleryItem,
} from '../services/contentStore';
import {
  getMediaListApi,
  mapApiMediaItem,
  uploadMediaApi,
} from '../services/media/mediaService';
import { CreateContentMediaModal } from './CreateContentMediaModal';
import { getActiveWebsiteId } from '../utils/websiteDomain';
import {
  deleteContentAndMediaFlow,
  getAllWebsiteContentsAsync,
  getWebsiteContentByIdAsync,
  publishWebsiteContentAsync,
} from '../services/websiteContent/websiteContentService';

const DEFAULT_CATEGORIES = ['Products', 'Projects', 'Store', 'Events', 'Team', 'Videos'];

const titleFromFile = (name) =>
  name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

export function GalleryManager({
  gallery,
  toast,
  confirm,
  websites = [],
  currentWebsite,
  onSelectWebsite,
  isSuperAdmin = false,
}) {
  const [uploadCategory, setUploadCategory] = useState('Products');
  const [uploading, setUploading] = useState(null); // { done, total }
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all'); // 'all' | 'image' | 'video'
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);
  const [isPageDragOver, setIsPageDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Content Creation Dialog queue (opens after upload or on button click)
  const [contentModalQueue, setContentModalQueue] = useState([]);
  const [contentModalIndex, setContentModalIndex] = useState(0);

  // Edit mode: holds { mediaItem, contentData } when user clicks a card with linkedContents
  const [editContentItem, setEditContentItem] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  // Server media list state (GET /api/Media/List)
  const [serverMedia, setServerMedia] = useState([]);
  const [loadingServerMedia, setLoadingServerMedia] = useState(false);

  const uploadLock = useRef(false);
  const dragCounter = useRef(0);

  const activeWebsiteId = currentWebsite?.websiteId || websites[0]?.websiteId || getActiveWebsiteId();

  // Load uploaded media from real API: GET /api/Media/List?websiteId=...
  const loadServerMedia = useCallback(async (siteId) => {
    if (!siteId) return;
    setLoadingServerMedia(true);
    try {
      const [res, contentRes] = await Promise.all([
        getMediaListApi({ websiteId: siteId }),
        getAllWebsiteContentsAsync(siteId, false),
      ]);

      // The media list has no publish flag, so build contentId -> isPublished
      // from GET /api/WebsiteContent/List and use it for the eye/hide state.
      const publishMap = new Map();
      const contentBody =
        contentRes && typeof contentRes !== 'boolean' ? contentRes.data?.data : null;
      const contentList = Array.isArray(contentBody)
        ? contentBody
        : Array.isArray(contentBody?.data)
          ? contentBody.data
          : Array.isArray(contentBody?.items)
            ? contentBody.items
            : [];
      contentList.forEach((c) => {
        const cid = Number(c?.contentId ?? c?.ContentId);
        if (!cid) return;
        const pub = c?.isPublished ?? c?.IsPublished;
        if (pub !== undefined && pub !== null) {
          publishMap.set(cid, pub === true || pub === 'true');
        }
      });

      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((raw) => {
          const item = mapApiMediaItem(raw);
          const cid = Number(item.linkedContents?.[0]?.contentId ?? item.contentId);
          if (cid && publishMap.has(cid)) {
            item.visible = publishMap.get(cid);
          }
          return item;
        });
        setServerMedia(mapped);
      }
    } catch (err) {
      console.warn('Could not load server media:', err);
    } finally {
      setLoadingServerMedia(false);
    }
  }, []);

  useEffect(() => {
    loadServerMedia(activeWebsiteId);
  }, [activeWebsiteId, loadServerMedia]);

  // Combined gallery items (Server items + any local drafts)
  const allMediaItems = useMemo(() => {
    if (!serverMedia || serverMedia.length === 0) {
      return gallery;
    }
    const serverIds = new Set(serverMedia.map((m) => String(m.mediaId || m.id)));
    const localOnly = gallery.filter(
      (g) => !g.mediaId || !serverIds.has(String(g.mediaId))
    );
    return [...serverMedia, ...localOnly];
  }, [serverMedia, gallery]);

  const categories = useMemo(
    () => [...new Set([...DEFAULT_CATEGORIES, ...allMediaItems.map((g) => g.category).filter(Boolean)])],
    [allMediaItems]
  );

  const filtered = allMediaItems.filter((g) => {
    const q = search.trim().toLowerCase();
    const matchQ = !q || `${g.title} ${g.caption} ${g.category}`.toLowerCase().includes(q);
    const matchC = filter === 'All' || g.category === filter;
    const isVideo = g.type === 'video' || g.mimeType?.startsWith('video/') || g.src?.startsWith('data:video');
    const matchT =
      mediaTypeFilter === 'all' ||
      (mediaTypeFilter === 'video' && isVideo) ||
      (mediaTypeFilter === 'image' && !isVideo);
    return matchQ && matchC && matchT;
  });

  const handleFiles = async (fileList) => {
    if (!fileList || !fileList.length) return;
    if (uploadLock.current) return;
    uploadLock.current = true;

    // Deduplicate any exact same file instances in the same batch
    const rawFiles = Array.from(fileList);
    const seen = new Set();
    const files = [];
    for (const f of rawFiles) {
      const key = `${f.name}_${f.size}_${f.lastModified}`;
      if (!seen.has(key)) {
        seen.add(key);
        files.push(f);
      }
    }

    if (!files.length) {
      uploadLock.current = false;
      return;
    }

    setUploading({ done: 0, total: files.length });
    let ok = 0;
    const errors = [];
    const baseOrder = gallery.length;
    const uploadedForContentModal = [];

    try {
      for (let i = 0; i < files.length; i += 1) {
        try {
          const media = await processMedia(files[i]);
          const isVideo = media.type === 'video';
          const title = titleFromFile(files[i].name);
          const category = isVideo && uploadCategory === 'Products' ? 'Videos' : uploadCategory;
          const displayOrder = baseOrder + i;

          // 1. Upload to backend API: POST /api/Media/Upload using multipart/form-data
          let uploadedServerItem = null;
          try {
            const apiRes = await uploadMediaApi({
              file: files[i],
              mediaDetails: `${title} (${category})`,
              displayOrder,
              websiteId: activeWebsiteId,
            });

            if (apiRes?.success) {
              uploadedServerItem = apiRes.data;
            } else if (apiRes?.message) {
              console.warn('Media upload API notice:', apiRes.message);
            }
          } catch (apiErr) {
            console.warn('Media upload API call failed, saving to local store:', apiErr);
          }

          const serverUrl =
            uploadedServerItem?.fileUrl ||
            uploadedServerItem?.url ||
            uploadedServerItem?.filePath ||
            uploadedServerItem?.data?.fileUrl ||
            uploadedServerItem?.data?.url ||
            null;

          const serverMediaId =
            uploadedServerItem?.mediaId ||
            uploadedServerItem?.MediaId ||
            uploadedServerItem?.id ||
            uploadedServerItem?.Id ||
            uploadedServerItem?.data?.mediaId ||
            uploadedServerItem?.data?.MediaId ||
            uploadedServerItem?.data?.id ||
            null;

          // 2. Persist media item with server URL or local data URL
          await saveGalleryItem({
            src: serverUrl || media.src,
            localSrc: media.src,
            poster: media.poster || null,
            type: media.type, // 'image' or 'video'
            mimeType: media.mimeType,
            duration: media.duration || null,
            title,
            caption: '',
            category,
            visible: true,
            order: displayOrder,
            websiteId: activeWebsiteId,
            mediaId: serverMediaId,
          });

          uploadedForContentModal.push({
            mediaId: serverMediaId,
            src: serverUrl || media.src,
            poster: media.poster || null,
            type: media.type,
            mimeType: media.mimeType,
            title,
            category,
            caption: '',
            order: displayOrder,
            websiteId: activeWebsiteId,
          });

          ok += 1;
        } catch (err) {
          errors.push(err.message);
        }
        setUploading({ done: i + 1, total: files.length });
      }
    } finally {
      uploadLock.current = false;
      setUploading(null);
      loadServerMedia(activeWebsiteId);
    }

    if (ok) toast(`${ok} item${ok > 1 ? 's' : ''} uploaded successfully`);
    errors.forEach((e) => toast(e, 'error'));

    // Automatically open Content Creation Dialog for newly uploaded media
    if (uploadedForContentModal.length > 0) {
      setContentModalQueue(uploadedForContentModal);
      setContentModalIndex(0);
    }
  };

  // Open modal: edit mode if card has linkedContents, create mode otherwise
  const handleMediaCardClick = async (item) => {
    const primaryLink = item.linkedContents?.[0];
    if (!primaryLink?.contentId) {
      // No linked content — open create modal
      setContentModalQueue([item]);
      setContentModalIndex(0);
      return;
    }
    // Has linked content — fetch full content data then open edit modal
    setLoadingContent(true);
    try {
      const wsId = item.websiteId || activeWebsiteId;
      const res = await getWebsiteContentByIdAsync(primaryLink.contentId, wsId);
      if (res && typeof res !== 'boolean' && res.data?.status === 200) {
        // Server body shape: { success, data: { contentId, ... } } OR the object directly
        const serverBody = res.data.data;         // axios response body
        const contentData =
          serverBody?.contentId != null           // flat object: use as-is
            ? serverBody
            : serverBody?.data ?? serverBody;    // wrapped: unwrap .data
        // Ensure we always carry the known content id so the modal updates (never creates)
        if (contentData?.contentId == null) contentData.contentId = primaryLink.contentId;
        console.log('[EditContent] fetched:', contentData);
        setEditContentItem({ mediaItem: item, contentData });
      } else {
        // Content exists (we know its id) but the fetch failed — still open in EDIT mode
        // so the Update API is used instead of accidentally creating new content.
        setEditContentItem({
          mediaItem: item,
          contentData: {
            contentId: primaryLink.contentId,
            category: primaryLink.category,
            title: primaryLink.contentTitle,
          },
        });
      }
    } catch (err) {
      console.warn('Failed to load content for editing:', err);
      setEditContentItem({
        mediaItem: item,
        contentData: {
          contentId: primaryLink.contentId,
          category: primaryLink.category,
          title: primaryLink.contentTitle,
        },
      });
    } finally {
      setLoadingContent(false);
    }
  };

  const toggleVisible = async (item) => {
    const nextVisible = item.visible === false;
    const contentId = item.linkedContents?.[0]?.contentId ?? item.contentId;

    // Linked content → use the WebsiteContent/Publish API to show/hide on the website
    if (contentId) {
      const res = await publishWebsiteContentAsync(
        contentId,
        item.websiteId || activeWebsiteId,
        nextVisible
      );
      const ok =
        res &&
        typeof res !== 'boolean' &&
        (res.data?.status === 200 || res.data?.status === 204);

      if (ok) {
        toast(
          nextVisible
            ? 'Content is now published on the website'
            : 'Content unpublished from the website'
        );
        // Reflect the new publish state on the card right away
        const itemKey = String(item.mediaId || item.id);
        setServerMedia((prev) =>
          prev.map((m) =>
            String(m.mediaId || m.id) === itemKey ? { ...m, visible: nextVisible } : m
          )
        );
      } else {
        const msg =
          (res && typeof res !== 'boolean' && (res.data?.data?.message || res.data?.data?.title)) ||
          'Failed to update the publish state.';
        toast(msg, 'error');
      }
      return;
    }

    // No linked content — local visibility toggle only
    await saveGalleryItem({ ...item, visible: nextVisible });
    toast(nextVisible ? 'Item is now visible on the website' : 'Item hidden from the website');
  };

  const handleDelete = async (item) => {
    const isVideo = item.type === 'video' || item.mimeType?.startsWith('video/');
    const ok = await confirm({
      title: `Delete ${isVideo ? 'video' : 'image'}?`,
      text: `"${item.title || 'Untitled'}" will be permanently removed from your website.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;

    // Call API delete flow if this is a server-synced media item
    if (item.mediaId) {
      const primaryLink = item.linkedContents?.[0];
      const result = await deleteContentAndMediaFlow({
        mediaId: item.mediaId,
        contentId: primaryLink?.contentId || item.contentId,
        contentMediaId: primaryLink?.contentMediaId || item.contentMediaId,
        websiteId: item.websiteId || activeWebsiteId,
      });
      if (!result.success) {
        toast(result.message || 'Delete failed — please try again.', 'error');
        return;
      }
    }

    // Remove from local store and selection
    await deleteGalleryItem(item.id);
    setSelected((s) => s.filter((id) => id !== item.id));
    // Immediately drop it from the rendered list (don't wait on a re-fetch)
    const removedKey = String(item.mediaId || item.id);
    setServerMedia((list) => list.filter((m) => String(m.mediaId || m.id) !== removedKey));
    toast(`${isVideo ? 'Video' : 'Image'} deleted permanently`);
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: `Delete ${selected.length} items?`,
      text: 'The selected media items will be permanently removed from your website.',
      confirmText: 'Delete all',
      danger: true,
    });
    if (!ok) return;
    await Promise.all(selected.map((id) => deleteGalleryItem(id)));
    // Immediately drop the selected items from the rendered list
    const selectedKeys = new Set(selected.map(String));
    setServerMedia((list) => list.filter((m) => !selectedKeys.has(String(m.mediaId || m.id))));
    toast(`${selected.length} items deleted`);
    setSelected([]);
  };

  const move = async (item, dir) => {
    const list = [...gallery];
    const idx = list.findIndex((g) => g.id === item.id);
    const swap = idx + dir;
    if (swap < 0 || swap >= list.length) return;
    [list[idx], list[swap]] = [list[swap], list[idx]];
    await Promise.all(list.map((g, i) => (g.order !== i ? saveGalleryItem({ ...g, order: i }) : null)));
  };

  // Drag and Drop card reordering
  const handleDragStartCard = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOverCard = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDropCard = async (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...gallery];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save new order positions
    await Promise.all(reordered.map((item, idx) => saveGalleryItem({ ...item, order: idx })));
    toast('Gallery order updated');
  };

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // Global page drag-and-drop handlers with counter to prevent flickering & double drops
  const handlePageDragEnter = (e) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      setIsPageDragOver(true);
    }
  };

  const handlePageDragOver = (e) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
      setIsPageDragOver(true);
    }
  };

  const handlePageDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsPageDragOver(false);
    }
  };

  const handlePageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsPageDragOver(false);
    if (e.dataTransfer?.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const videoCount = allMediaItems.filter(
    (g) => g.type === 'video' || g.mimeType?.startsWith('video/') || g.src?.startsWith('data:video')
  ).length;

  return (
    <div
      className="adm-stack"
      onDragEnter={handlePageDragEnter}
      onDragOver={handlePageDragOver}
      onDragLeave={handlePageDragLeave}
      onDrop={handlePageDrop}
      style={{ position: 'relative' }}
    >
      {/* Full Area Drag-and-Drop Active Overlay */}
      {isPageDragOver && (
        <div
          className="adm-drop-overlay"
          onDragOver={handlePageDragOver}
          onDragLeave={handlePageDragLeave}
          onDrop={handlePageDrop}
        >
          <div className="adm-drop-overlay-box">
            <div className="adm-drop-overlay-icon">
              <AdminIcon name="upload" size={48} />
            </div>
            <h3>Drop Images or Videos Anywhere!</h3>
            <p>Release to instantly upload files into the {uploadCategory} category.</p>
          </div>
        </div>
      )}

      {/* Upload card */}
      <section className="adm-card">
        <div className="adm-card-head adm-card-head--wrap">
          <div>
            <h3>Upload Images & Videos</h3>
            <p className="adm-muted">
              Add photos or videos to your website gallery. Drag & drop files directly or click to browse.
            </p>
          </div>
          <div className="adm-toolbar">
            {websites.length > 0 && (
              <label className="adm-inline-field">
                <span style={{ fontWeight: 600 }}>Target Website:</span>
                <select
                  className="adm-input adm-select"
                  value={activeWebsiteId}
                  onChange={(e) => {
                    const found = websites.find((w) => w.websiteId === Number(e.target.value));
                    if (found && onSelectWebsite) onSelectWebsite(found);
                  }}
                >
                  {websites.map((w) => (
                    <option key={w.websiteId} value={w.websiteId}>
                      {w.websiteName} (#{w.websiteId})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="adm-inline-field">
              <span style={{ fontWeight: 600 }}>Category:</span>
              <select
                className="adm-input adm-select"
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {uploading ? (
          <div className="adm-progress-box">
            <div className="adm-progress-text">
              <span className="adm-spinner adm-spinner--dark" />
              Uploading & processing {uploading.done} of {uploading.total}…
            </div>
            <div className="adm-progress">
              <div
                className="adm-progress-bar"
                style={{ width: `${(uploading.done / uploading.total) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <Dropzone
            onFiles={handleFiles}
            label="Drop images or videos here, or click to browse"
            helpText="Supports JPG, PNG, WEBP, GIF (up to 15MB) and MP4, WEBM, MOV videos (up to 100MB)"
          />
        )}
      </section>

      {/* Library */}
      <section className="adm-card">
        <div className="adm-card-head adm-card-head--wrap">
          <div>
            <h3>Media Library</h3>
            <p className="adm-muted">
              {allMediaItems.length} item{allMediaItems.length !== 1 ? 's' : ''} ({videoCount} video{videoCount !== 1 ? 's' : ''}) ·{' '}
              {allMediaItems.filter((g) => g.visible !== false).length} visible on site
              {loadingServerMedia && <span style={{ marginLeft: 8, color: 'var(--adm-orange)' }}>· Syncing with server…</span>}
            </p>
          </div>
          <div className="adm-toolbar">
            <button
              type="button"
              className="adm-btn adm-btn--ghost"
              title="Refresh and sync media from server"
              disabled={loadingServerMedia}
              onClick={() => {
                loadServerMedia(activeWebsiteId);
                toast('Syncing media from server…');
              }}
            >
              <AdminIcon name="refresh" size={15} />
              <span>{loadingServerMedia ? 'Syncing…' : 'Sync Server'}</span>
            </button>

            <div className="adm-search">
              <AdminIcon name="search" size={16} />
              <input
                placeholder="Search media…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Media type filter buttons */}
            <div className="adm-tabs" style={{ margin: 0, padding: 2, background: 'var(--adm-border)' }}>
              <button
                type="button"
                className={`adm-tab ${mediaTypeFilter === 'all' ? 'is-active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                onClick={() => setMediaTypeFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`adm-tab ${mediaTypeFilter === 'image' ? 'is-active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                onClick={() => setMediaTypeFilter('image')}
              >
                Images
              </button>
              <button
                type="button"
                className={`adm-tab ${mediaTypeFilter === 'video' ? 'is-active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                onClick={() => setMediaTypeFilter('video')}
              >
                Videos ({videoCount})
              </button>
            </div>

            <select
              className="adm-input adm-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {selected.length > 0 && (
              <button type="button" className="adm-btn adm-btn--danger" onClick={handleBulkDelete}>
                <AdminIcon name="trash" size={16} /> Delete ({selected.length})
              </button>
            )}
          </div>
        </div>

        {filter === 'All' && !search && mediaTypeFilter === 'all' && gallery.length > 1 && (
          <div
            className="adm-alert"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              color: '#64748b',
            }}
          >
            <AdminIcon name="grip" size={14} />
            <span>
              <strong>Tip:</strong> Drag and drop any card to reorder how images and videos appear in your website gallery.
            </span>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon="gallery"
            title={gallery.length ? 'No media matches your search' : 'Your gallery is empty'}
            text={
              gallery.length
                ? 'Try a different search or filter.'
                : 'Upload images or videos above, or drag and drop files anywhere on this page.'
            }
          />
        ) : (
          <div className="adm-media-grid">
            {filtered.map((item, idx) => {
              const isVideo =
                item.type === 'video' ||
                item.mimeType?.startsWith('video/') ||
                item.src?.startsWith('data:video');

              const isDraggingThis = draggedIndex === idx;
              const isDragTarget = dragOverIndex === idx;

              return (
                <div
                  key={item.id}
                  className={`adm-media-card ${item.visible === false ? 'is-hidden' : ''} ${
                    selected.includes(item.id) ? 'is-selected' : ''
                  } ${isDraggingThis ? 'is-dragging' : ''} ${isDragTarget ? 'is-drag-target' : ''}`}
                  draggable={filter === 'All' && !search && mediaTypeFilter === 'all'}
                  onDragStart={(e) => handleDragStartCard(e, idx)}
                  onDragOver={(e) => handleDragOverCard(e, idx)}
                  onDrop={(e) => handleDropCard(e, idx)}
                >
                  {/* Clicking the image opens the Edit details dialog */}
                  <div
                    className="adm-media-thumb"
                    title="Click to edit details"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setEditing({ ...item })}
                  >
                    {isVideo ? (
                      <div className="adm-video-wrapper">
                        <video
                          src={item.src}
                          poster={item.poster || undefined}
                          muted
                          preload="metadata"
                          playsInline
                          onMouseEnter={(e) => {
                            e.currentTarget.play().catch(() => {});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                        <div className="adm-media-play-overlay">
                          <AdminIcon name="play" size={20} />
                        </div>
                      </div>
                    ) : (
                      <img src={item.src} alt={item.title} loading="lazy" />
                    )}

                    {/* Drag Grip Handle */}
                    {filter === 'All' && !search && mediaTypeFilter === 'all' && (
                      <div
                        className="adm-media-grip-handle"
                        title="Drag to reorder"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AdminIcon name="grip" size={14} />
                      </div>
                    )}

                    {/* Select Checkbox */}
                    <label
                      className="adm-media-select"
                      title="Select"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </label>

                    {/* Video / Hidden Badge */}
                    <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 6 }}>
                      {isVideo && (
                        <span className="adm-media-flag adm-media-flag--video">
                          <AdminIcon name="video" size={11} /> Video
                        </span>
                      )}
                      {item.visible === false && (
                        <span className="adm-media-flag">Hidden</span>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="adm-media-actions">
                      <button
                        type="button"
                        className="adm-icon-btn"
                        title={item.linkedContents?.length ? 'Edit Website Content' : 'Create Website Content from this media'}
                        style={{ color: 'var(--adm-orange)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMediaCardClick(item);
                        }}
                        disabled={loadingContent}
                      >
                        <AdminIcon name={item.linkedContents?.length ? 'edit' : 'plus'} size={16} />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn"
                        title={item.visible === false ? 'Show on website' : 'Hide from website'}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVisible(item);
                        }}
                      >
                        <AdminIcon name={item.visible === false ? 'eyeOff' : 'eye'} size={16} />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn is-danger"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                      >
                        <AdminIcon name="trash" size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="adm-media-info">
                    <strong title={item.title}>{item.title || 'Untitled'}</strong>
                    <div className="adm-media-meta">
                      <span className="adm-tag">{item.category || 'Uncategorised'}</span>
                      {filter === 'All' && !search && mediaTypeFilter === 'all' && (
                        <span className="adm-order-btns">
                          <button
                            type="button"
                            title="Move left"
                            disabled={idx === 0}
                            onClick={() => move(item, -1)}
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            title="Move right"
                            disabled={idx === gallery.length - 1}
                            onClick={() => move(item, 1)}
                          >
                            ›
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit Media Modal */}
      {editing && (
        <EditMediaModal
          item={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onCreateContent={(mediaToCreate) => {
            setContentModalQueue([mediaToCreate]);
            setContentModalIndex(0);
          }}
          onSave={async (updated) => {
            await saveGalleryItem(updated);
            setEditing(null);
            toast('Media details saved successfully');
          }}
          toast={toast}
        />
      )}

      {/* Website Content Creation Modal (Flow for uploaded media) */}
      {contentModalQueue.length > 0 && contentModalQueue[contentModalIndex] && (
        <CreateContentMediaModal
          mediaItem={contentModalQueue[contentModalIndex]}
          websiteId={activeWebsiteId}
          websites={websites}
          categories={categories}
          queueIndex={contentModalIndex}
          queueTotal={contentModalQueue.length}
          onClose={() => {
            if (contentModalIndex + 1 < contentModalQueue.length) {
              setContentModalIndex((idx) => idx + 1);
            } else {
              setContentModalQueue([]);
              setContentModalIndex(0);
            }
          }}
          onSuccess={() => {
            loadServerMedia(activeWebsiteId);
          }}
          toast={toast}
        />
      )}

      {/* Website Content Edit Modal (opens when clicking a media card with linkedContents) */}
      {editContentItem && (
        <CreateContentMediaModal
          mode="edit"
          mediaItem={editContentItem.mediaItem}
          existingContent={editContentItem.contentData}
          websiteId={activeWebsiteId}
          websites={websites}
          categories={categories}
          onClose={() => setEditContentItem(null)}
          onSuccess={() => {
            setEditContentItem(null);
            loadServerMedia(activeWebsiteId);
          }}
          toast={toast}
        />
      )}
    </div>
  );
}

function EditMediaModal({ item, categories, onClose, onSave, onCreateContent, toast }) {
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const isVideo =
    form.type === 'video' ||
    form.mimeType?.startsWith('video/') ||
    form.src?.startsWith('data:video');

  const replace = async ([file]) => {
    try {
      const media = await processMedia(file);
      setForm((prev) => ({
        ...prev,
        src: media.src,
        poster: media.poster || prev.poster,
        type: media.type,
        mimeType: media.mimeType,
        duration: media.duration || prev.duration,
      }));
      toast(`${media.type === 'video' ? 'Video' : 'Image'} replaced`);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <Modal
      title={isVideo ? 'Edit Video Details' : 'Edit Image Details'}
      subtitle={`Uploaded ${formatDate(item.createdAt)} · ${dataUrlSizeKb(form.src)} KB`}
      onClose={onClose}
      size="lg"
      footer={
        <>
          {onCreateContent && (
            <button
              type="button"
              className="adm-btn adm-btn--light"
              style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => {
                onClose();
                onCreateContent(form);
              }}
            >
              <AdminIcon name="fileText" size={14} />
              <span>Create Website Content</span>
            </button>
          )}
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await onSave(form);
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </>
      }
    >
      <div className="adm-edit-grid">
        <div className="adm-edit-preview">
          {isVideo ? (
            <video
              src={form.src}
              poster={form.poster || undefined}
              controls
              style={{
                width: '100%',
                maxHeight: 280,
                borderRadius: 10,
                background: '#0f172a',
                display: 'block',
              }}
            />
          ) : (
            <img src={form.src} alt={form.title} style={{ width: '100%', borderRadius: 10 }} />
          )}

          <Dropzone
            onFiles={replace}
            multiple={false}
            compact
            label={isVideo ? 'Replace with new video or image' : 'Replace with new image or video'}
          />
        </div>

        <div className="adm-form">
          <label className="adm-field">
            <span className="adm-label">Title</span>
            <input
              className="adm-input"
              value={form.title || ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Product Demo Showcase"
            />
          </label>

          <label className="adm-field">
            <span className="adm-label">Category</span>
            <input
              className="adm-input"
              list="adm-cat-list"
              value={form.category || ''}
              onChange={(e) => set('category', e.target.value)}
              placeholder="Choose or type a new category"
            />
            <datalist id="adm-cat-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>

          <label className="adm-field">
            <span className="adm-label">Caption / Description</span>
            <textarea
              className="adm-input adm-textarea"
              rows={4}
              value={form.caption || ''}
              onChange={(e) => set('caption', e.target.value)}
              placeholder="Shown when visitors click on the media in your gallery"
            />
          </label>

          <Switch
            checked={form.visible !== false}
            onChange={(v) => set('visible', v)}
            label={`Show this ${isVideo ? 'video' : 'image'} on the website`}
          />
        </div>
      </div>
    </Modal>
  );
}

export default GalleryManager;
