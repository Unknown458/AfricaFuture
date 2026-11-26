import { useState, useEffect } from 'react';
import AdminIcon from './AdminIcon';
import { Modal, Switch } from './AdminUI';
import { saveContentWithMediaFlow } from '../services/websiteContent/websiteContentService';
import { getActiveWebsiteId } from '../utils/websiteDomain';

const CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP'];
const CONTENT_TYPES = ['Product', 'Service', 'Project', 'Promotion', 'Gallery', 'Testimonial', 'Page'];
const DEFAULT_CATEGORY_OPTIONS = [
  'Curtains',
  'Kitchen',
  'Studio',
  'Video',
  'Videos',
  'Bedroom Curtain',
  'Dining Room',
];

// Backend may return customFields as an object; the textarea needs a string.
const toCustomFieldsString = (cf) => {
  if (!cf) return '';
  if (typeof cf === 'string') return cf;
  try {
    return JSON.stringify(cf, null, 2);
  } catch {
    return '';
  }
};

export function CreateContentMediaModal({
  mediaItem,
  websiteId,
  websites = [],
  categories = [],
  onClose,
  onSuccess,
  toast,
  queueIndex = 0,
  queueTotal = 0,
  mode = 'create',          // 'create' | 'edit'
  existingContent = null,   // pre-filled content data for edit mode
}) {
  const isVideo =
    mediaItem?.type === 'video' ||
    mediaItem?.mimeType?.startsWith('video/') ||
    mediaItem?.src?.startsWith('data:video') ||
    /\.(mp4|webm|mov|ogg|m4v)$/i.test(mediaItem?.src || '');

  // Dynamic Website ID (resolved dynamically from prop, mediaItem, active session, or website list)
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(() => {
    return (
      websiteId ||
      mediaItem?.websiteId ||
      getActiveWebsiteId() ||
      websites[0]?.websiteId ||
      ''
    );
  });

  // Normalize existingContent — handles flat { contentId, title, ... } OR wrapped { data: {...} }
  const ec = existingContent?.contentId != null
    ? existingContent                        // already a flat content object
    : (existingContent?.data ?? existingContent);  // unwrap server wrapper if needed

  // Form State — pre-filled from ec when mode === 'edit'
  const [title, setTitle] = useState(ec?.title || mediaItem?.title || '');
  const [category, setCategory] = useState(ec?.category || mediaItem?.category || 'Products');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearching, setCategorySearching] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);
  const [contentType, setContentType] = useState(ec?.contentType || mediaItem?.contentType || 'Product');
  const [shortDescription, setShortDescription] = useState(ec?.shortDescription || '');
  const [description, setDescription] = useState(ec?.description || mediaItem?.caption || '');
  const [price, setPrice] = useState(String(ec?.price ?? '0'));
  const [currency, setCurrency] = useState(ec?.currency || 'ZAR');
  const [warranty, setWarranty] = useState(ec?.warranty || '');
  const [isActive, setIsActive] = useState(ec?.isActive !== false);
  const [displayOrder, setDisplayOrder] = useState(ec?.displayOrder ?? mediaItem?.order ?? 0);
  const [customFields, setCustomFields] = useState(toCustomFieldsString(ec?.customFields));

  // Sync state if existingContent is populated after mount (async edge case)
  useEffect(() => {
    if (!ec?.contentId) return;
    setTitle(ec.title || '');
    setCategory(ec.category || 'Products');
    setContentType(ec.contentType || 'Product');
    setShortDescription(ec.shortDescription || '');
    setDescription(ec.description || '');
    setPrice(String(ec.price ?? '0'));
    setCurrency(ec.currency || 'ZAR');
    setWarranty(ec.warranty || '');
    setIsActive(ec.isActive !== false);
    setDisplayOrder(ec.displayOrder ?? 0);
    setCustomFields(toCustomFieldsString(ec.customFields));
    if (mode === 'edit') setIsPublished(ec.isPublished === true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ec?.contentId]);

  // Media link fields — pre-filled from linkedContents[0] when available
  const primaryLink = mediaItem?.linkedContents?.[0];
  const [imageDescription, setImageDescription] = useState(primaryLink?.imageDescription || ec?.description || mediaItem?.caption || '');
  const [altText, setAltText] = useState(primaryLink?.altText || ec?.title || mediaItem?.title || '');
  const [isPrimary, setIsPrimary] = useState(primaryLink?.isPrimary !== false);
  const [mediaDisplayOrder, setMediaDisplayOrder] = useState(primaryLink?.displayOrder ?? 0);

  // Publish Toggle — pre-filled from existingContent in edit mode
  const [isPublished, setIsPublished] = useState(mode === 'edit' ? (ec?.isPublished === true) : false);

  // Submission state
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const categoryOptions = Array.from(
    new Map(
      [...DEFAULT_CATEGORY_OPTIONS, ...(Array.isArray(categories) ? categories : [])]
        .filter((option) => typeof option === 'string' && option.trim())
        .map((option) => [option.trim().toLowerCase(), option.trim()])
    ).values()
  );
  const filteredCategoryOptions = categoryOptions.filter((option) =>
    !categorySearching || option.toLowerCase().includes(category.trim().toLowerCase())
  );

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast('Please enter a content title', 'error');
      return;
    }

    const dynamicSiteId = Number(
      selectedWebsiteId || websiteId || mediaItem?.websiteId || getActiveWebsiteId()
    );

    if (!dynamicSiteId || isNaN(dynamicSiteId) || dynamicSiteId <= 0) {
      toast('Dynamic website ID is missing. Please select a target website.', 'error');
      return;
    }

    if (!mediaItem?.mediaId) {
      toast('Warning: Media ID is missing. Creating content anyway…', 'error');
    }

    // Edit mode: resolve the existing IDs so the service calls UPDATE (never CREATE)
    // and keeps the existing media link (no WebsiteContentMedia/Add call).
    const existingContentId = mode === 'edit'
      ? (ec?.contentId ?? mediaItem?.contentId ?? primaryLink?.contentId)
      : undefined;
    const existingContentMediaId = mode === 'edit'
      ? (primaryLink?.contentMediaId ?? mediaItem?.contentMediaId)
      : undefined;

    if (mode === 'edit' && !(existingContentId > 0)) {
      toast('Cannot update: content ID is missing. Please reopen the content and try again.', 'error');
      return;
    }

    setSaving(true);
    setStatusMessage('Initiating save flow…');

    try {
      const result = await saveContentWithMediaFlow({
        websiteId: dynamicSiteId,
        mediaId: Number(mediaItem?.mediaId || 0),
        // NOTE: the flow expects the property names `contentId` / `contentMediaId`
        contentId: existingContentId,
        contentMediaId: existingContentMediaId,
        contentData: {
          category,
          contentType,
          title: title.trim(),
          shortDescription: shortDescription.trim(),
          description: description.trim(),
          price: parseFloat(price) || 0,
          currency,
          warranty: warranty.trim(),
          isActive,
          isPublished,
          displayOrder: parseInt(displayOrder, 10) || 0,
          customFields: customFields.trim() || '{}',
        },
        mediaData: {
          isPrimary,
          imageDescription: imageDescription.trim() || description.trim() || title.trim(),
          altText: altText.trim() || title.trim(),
          displayOrder: parseInt(mediaDisplayOrder, 10) || 0,
        },
        publishImmediately: isPublished,
        onProgressStatus: (msg) => setStatusMessage(msg),
      });

      if (result.success) {
        const action = mode === 'edit' ? 'updated' : 'created';
        const publishNote = isPublished
          ? `Content ${action} for Website #${dynamicSiteId} and published live!`
          : `Content ${action} for Website #${dynamicSiteId} as draft.`;
        toast(publishNote);
        if (onSuccess) {
          onSuccess(result);
        }
        onClose();
      } else {
        toast(result.message || 'Error occurred while saving content', 'error');
      }
    } catch (err) {
      console.error('Failed to complete content save flow:', err);
      toast(err.message || 'An unexpected error occurred', 'error');
    } finally {
      setSaving(false);
      setStatusMessage('');
    }
  };

  const queueBadge =
    queueTotal > 1 ? ` · Item ${queueIndex + 1} of ${queueTotal}` : '';

  const isEditMode = mode === 'edit';

  const currentSiteName =
    websites.find((w) => w.websiteId === Number(selectedWebsiteId))?.websiteName ||
    `Website #${selectedWebsiteId || '—'}`;

  return (
    <Modal
      title={isEditMode ? 'Edit Website Content' : 'Create Website Content'}
      subtitle={isEditMode
        ? `Editing content #${existingContent?.contentId || '—'} · Media #${mediaItem?.mediaId || '—'} · ${currentSiteName}`
        : `Link media #${mediaItem?.mediaId || '—'} to ${currentSiteName}${queueBadge}`}
      onClose={onClose}
      size="lg"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {saving && (
              <>
                <span className="adm-spinner adm-spinner--dark" style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                  {statusMessage || 'Processing…'}
                </span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="adm-btn adm-btn--ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`adm-btn ${isPublished ? 'adm-btn--primary' : 'adm-btn--primary'}`}
              disabled={saving}
              onClick={handleSubmit}
              style={
                isPublished
                  ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#059669' }
                  : {}
              }
            >
              {saving ? (
                'Saving…'
              ) : isPublished ? (
                <>
                  <AdminIcon name="send" size={15} />
                  <span>{isEditMode ? 'Update & Publish' : 'Save & Publish'}</span>
                </>
              ) : (
                <>
                  <AdminIcon name="check" size={15} />
                  <span>{isEditMode ? 'Update Draft' : 'Save Draft'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="adm-content-modal-grid">
        {/* Left Column: Media Preview & Media-Specific Linking Info */}
        <div className="adm-content-preview-col">
          <div className="adm-content-media-card">
            <div className="adm-content-media-thumb">
              {isVideo ? (
                <video
                  src={mediaItem?.src}
                  poster={mediaItem?.poster || undefined}
                  controls
                  style={{ width: '100%', maxHeight: 220, borderRadius: 10, background: '#0f172a' }}
                />
              ) : (
                <img
                  src={mediaItem?.src}
                  alt={title || 'Media preview'}
                  style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10 }}
                />
              )}
            </div>

            <div className="adm-content-media-meta">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {mediaItem?.mediaId ? (
                  <span className="adm-pill adm-pill--light" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Media ID: #{mediaItem.mediaId}
                  </span>
                ) : (
                  <span className="adm-pill" style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e' }}>
                    New Media
                  </span>
                )}
                {websites.length > 0 ? (
                  <label className="adm-inline-field" style={{ fontSize: '0.75rem', margin: 0 }}>
                    <span style={{ fontWeight: 600 }}>Website:</span>
                    <select
                      className="adm-input adm-select"
                      style={{ fontSize: '0.75rem', padding: '2px 6px', height: 26 }}
                      value={selectedWebsiteId}
                      onChange={(e) => setSelectedWebsiteId(Number(e.target.value))}
                    >
                      {websites.map((w) => (
                        <option key={w.websiteId} value={w.websiteId}>
                          {w.websiteName} (#{w.websiteId})
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <span className="adm-pill adm-pill--light" style={{ fontSize: '0.75rem' }}>
                    Website #{selectedWebsiteId || '—'}
                  </span>
                )}
                <span className="adm-pill adm-pill--light" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                  {isVideo ? 'Video' : 'Image'}
                </span>
              </div>
            </div>
          </div>

          {/* Media Connection Fields (WebsiteContentMedia/Add) */}
          <div className="adm-card" style={{ padding: 14, marginTop: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#334155', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AdminIcon name="link" size={14} />
              <span>Media Attachment Settings</span>
            </h4>

            {/* Existing IDs are read-only on update — no new link is created */}
            {isEditMode && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <label className="adm-field" style={{ marginBottom: 0 }}>
                  <span className="adm-label" style={{ fontSize: '0.75rem' }}>Content ID</span>
                  <input
                    className="adm-input"
                    value={existingContent?.contentId ?? ec?.contentId ?? '—'}
                    readOnly
                    style={{ fontSize: '0.85rem', padding: '6px 10px', background: '#eef2f7', cursor: 'not-allowed' }}
                  />
                </label>
                <label className="adm-field" style={{ marginBottom: 0 }}>
                  <span className="adm-label" style={{ fontSize: '0.75rem' }}>Content Media ID</span>
                  <input
                    className="adm-input"
                    value={primaryLink?.contentMediaId ?? mediaItem?.contentMediaId ?? '—'}
                    readOnly
                    style={{ fontSize: '0.85rem', padding: '6px 10px', background: '#eef2f7', cursor: 'not-allowed' }}
                  />
                </label>
              </div>
            )}

            <label className="adm-field" style={{ marginBottom: 10 }}>
              <span className="adm-label" style={{ fontSize: '0.75rem' }}>Image / Media Description</span>
              <input
                className="adm-input"
                style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="Specific description for this image/video"
              />
            </label>

            <label className="adm-field" style={{ marginBottom: 10 }}>
              <span className="adm-label" style={{ fontSize: '0.75rem' }}>Alt Text (SEO &amp; Accessibility)</span>
              <input
                className="adm-input"
                style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Brief alternative text for screen readers"
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <Switch
                  checked={isPrimary}
                  onChange={setIsPrimary}
                  label="Primary Media"
                />
              </div>
              <label className="adm-field" style={{ marginBottom: 0 }}>
                <span className="adm-label" style={{ fontSize: '0.75rem' }}>Media Order</span>
                <input
                  type="number"
                  className="adm-input"
                  style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                  value={mediaDisplayOrder}
                  onChange={(e) => setMediaDisplayOrder(e.target.value)}
                  min="0"
                />
              </label>
            </div>
          </div>

          {/* Publish Toggle Box — placed in left column blank space */}
          <div
            className={`adm-publish-toggle-box ${isPublished ? 'is-active' : ''}`}
            style={{
              marginTop: 14,
              padding: '14px 16px',
              borderRadius: 12,
              background: isPublished ? 'rgba(16, 185, 129, 0.08)' : '#f8fafc',
              border: isPublished ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #e2e8f0',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.9rem', color: isPublished ? '#065f46' : '#1e293b' }}>
                  <AdminIcon name={isPublished ? 'send' : 'fileText'} size={16} />
                  <span>Publish Immediately to Website</span>
                </div>
              </div>
              <Switch
                checked={isPublished}
                onChange={setIsPublished}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Website Content Form (WebsiteContent/Create) */}
        <div className="adm-content-form-col">
          <div className="adm-form" style={{ gap: 12 }}>
            <label className="adm-field">
              <span className="adm-label">
                Content Title <span style={{ color: '#ef4444' }}>*</span>
              </span>
              <input
                className="adm-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Luxury Velvet Drapery"
                required
                autoFocus
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label className="adm-field">
                <span className="adm-label">Content Type</span>
                <select
                  className="adm-input adm-select"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                >
                  {contentType && !CONTENT_TYPES.includes(contentType) && (
                    <option value={contentType}>{contentType}</option>
                  )}
                  {CONTENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="adm-field">
                <span className="adm-label">Category</span>
                <div
                  className="adm-category-combobox"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setCategoryOpen(false);
                  }}
                >
                  <input
                    className="adm-input"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={categoryOpen}
                    aria-controls="adm-content-cat-list"
                    aria-activedescendant={
                      categoryOpen && activeCategoryIndex >= 0
                        ? `adm-content-cat-option-${activeCategoryIndex}`
                        : undefined
                    }
                    value={category}
                    onFocus={() => {
                      setCategorySearching(false);
                      setCategoryOpen(true);
                    }}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setCategorySearching(true);
                      setActiveCategoryIndex(-1);
                      setCategoryOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setCategoryOpen(true);
                        setActiveCategoryIndex((index) =>
                          Math.min(index + 1, filteredCategoryOptions.length - 1)
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setCategoryOpen(true);
                        setActiveCategoryIndex((index) =>
                          index <= 0 ? filteredCategoryOptions.length - 1 : index - 1
                        );
                      } else if (e.key === 'Enter' && categoryOpen) {
                        e.preventDefault();
                        const exactMatch = filteredCategoryOptions.find(
                          (option) => option.toLowerCase() === category.trim().toLowerCase()
                        );
                        const selected =
                          (activeCategoryIndex >= 0 &&
                            filteredCategoryOptions[activeCategoryIndex]) ||
                          exactMatch;
                        if (selected) setCategory(selected);
                        setCategoryOpen(false);
                      } else if (e.key === 'Escape') {
                        setCategoryOpen(false);
                        setActiveCategoryIndex(-1);
                      }
                    }}
                    placeholder="Choose or type a category"
                  />
                  <button
                    type="button"
                    className={`adm-category-dropdown-toggle${categoryOpen ? ' is-open' : ''}`}
                    aria-label={categoryOpen ? 'Hide category options' : 'Show category options'}
                    aria-expanded={categoryOpen}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (!categoryOpen) setCategorySearching(false);
                      setCategoryOpen(!categoryOpen);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {categoryOpen && (
                    <div className="adm-category-dropdown" id="adm-content-cat-list" role="listbox">
                      {filteredCategoryOptions.map((option, index) => (
                        <div
                          key={option}
                          id={`adm-content-cat-option-${index}`}
                          className={`adm-category-option${index === activeCategoryIndex ? ' is-active' : ''}`}
                          role="option"
                          aria-selected={option.toLowerCase() === category.trim().toLowerCase()}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setCategory(option);
                            setCategoryOpen(false);
                            setActiveCategoryIndex(-1);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                      {categorySearching &&
                        category.trim() &&
                        !categoryOptions.some(
                          (option) => option.toLowerCase() === category.trim().toLowerCase()
                        ) && (
                          <div className="adm-category-custom" aria-live="polite">
                            &quot;{category.trim()}&quot; will be added as a new category
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </label>
            </div>

            <label className="adm-field">
              <span className="adm-label">Short Description</span>
              <input
                className="adm-input"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="One sentence summary for listings &amp; previews"
              />
            </label>

            <label className="adm-field">
              <span className="adm-label">Full Description</span>
              <textarea
                className="adm-input adm-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive description of the item, features, and specifications"
              />
            </label>

            {/* Price, Currency & Warranty */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.2fr', gap: 10 }}>
              <label className="adm-field">
                <span className="adm-label">Price</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="adm-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </label>

              <label className="adm-field">
                <span className="adm-label">Currency</span>
                <select
                  className="adm-input adm-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="adm-field">
                <span className="adm-label">Warranty</span>
                <input
                  className="adm-input"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="e.g. 1 Year Warranty"
                />
              </label>
            </div>

            {/* Display Order & Active Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center', marginTop: 4 }}>
              <label className="adm-field" style={{ marginBottom: 0 }}>
                <span className="adm-label">Content Order</span>
                <input
                  type="number"
                  className="adm-input"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  min="0"
                />
              </label>

              <div style={{ paddingTop: 18 }}>
                <Switch
                  checked={isActive}
                  onChange={setIsActive}
                  label="Status: Active"
                />
              </div>
            </div>

            {/* Custom Fields */}
            <label className="adm-field" style={{ marginTop: 4 }}>
              <span className="adm-label">Custom Fields (optional)</span>
              <textarea
                className="adm-input adm-textarea"
                rows={3}
                value={customFields}
                onChange={(e) => setCustomFields(e.target.value)}
                placeholder='Custom attributes e.g. {"color":"Navy","material":"Silk"}'
                style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
              />
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CreateContentMediaModal;
