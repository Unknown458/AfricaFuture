import { useState } from 'react';
import AdminIcon from './AdminIcon';
import { Dropzone, EmptyState, Modal, StatusChip, Switch } from './AdminUI';
import { formatDate } from './formatDate';
import PromoCard from '../components/PromoCard';
import { PROMO_THEMES, getPromoTheme } from '../data/promoThemes';
import {
  deletePromotion,
  getPromotionStatus,
  processImage,
  savePromotion,
} from '../services/contentStore';

const EMPTY_PROMO = {
  title: '',
  subtitle: '',
  description: '',
  features: '',
  badge: 'NEW',
  discountLabel: '',
  price: '',
  oldPrice: '',
  ctaText: 'Claim This Offer',
  ctaLink: '',
  image: '',
  theme: 'orange',
  startDate: '',
  endDate: '',
  active: true,
  featured: false,
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'draft', label: 'Draft' },
  { id: 'expired', label: 'Expired' },
];

function PromotionsManager({ promotions, toast, confirm }) {
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);

  const withStatus = promotions.map((p) => ({ ...p, status: getPromotionStatus(p) }));
  const list = filter === 'all' ? withStatus : withStatus.filter((p) => p.status === filter);
  const countOf = (id) => (id === 'all' ? withStatus.length : withStatus.filter((p) => p.status === id).length);

  const save = async (promo) => {
    // Only one featured promotion at a time
    if (promo.featured) {
      await Promise.all(
        promotions.filter((p) => p.featured && p.id !== promo.id).map((p) => savePromotion({ ...p, featured: false }))
      );
    }
    await savePromotion(promo);
  };

  const handleDelete = async (promo) => {
    const ok = await confirm({
      title: 'Delete promotion?',
      text: `"${promo.title}" will be permanently removed.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    await deletePromotion(promo.id);
    toast('Promotion deleted');
  };

  const duplicate = async (promo) => {
    const { id: _id, createdAt: _c, updatedAt: _u, status: _s, ...rest } = promo;
    await savePromotion({ ...rest, title: `${promo.title} (Copy)`, active: false, featured: false });
    toast('Promotion duplicated as a draft');
  };

  const toggleActive = async (promo) => {
    const { status: _s, ...rest } = promo;
    await savePromotion({ ...rest, active: !promo.active });
    toast(promo.active ? 'Promotion paused (moved to drafts)' : 'Promotion activated');
  };

  const toggleFeatured = async (promo) => {
    const { status: _s, ...rest } = promo;
    await save({ ...rest, featured: !promo.featured });
    toast(promo.featured ? 'Removed from featured' : 'Set as featured promotion');
  };

  return (
    <div className="adm-stack">
      <section className="adm-card">
        <div className="adm-card-head adm-card-head--wrap">
          <div className="adm-tabs">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`adm-tab ${filter === f.id ? 'is-active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="adm-tab-count">{countOf(f.id)}</span>
              </button>
            ))}
          </div>
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => setEditing({ ...EMPTY_PROMO })}>
            <AdminIcon name="plus" size={16} /> New Promotion
          </button>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon="promo"
            title={promotions.length ? 'Nothing here' : 'No promotions yet'}
            text={
              promotions.length
                ? 'No promotions match this filter.'
                : 'Create your first promotion — it will appear in the "Current Promotions" section on your homepage.'
            }
            action={
              !promotions.length && (
                <button type="button" className="adm-btn adm-btn--primary" onClick={() => setEditing({ ...EMPTY_PROMO })}>
                  <AdminIcon name="plus" size={16} /> Create Promotion
                </button>
              )
            }
          />
        ) : (
          <div className="adm-promo-list">
            {list.map((p) => (
              <article key={p.id} className="adm-promo-row">
                <div
                  className="adm-promo-thumb"
                  style={!p.image ? { background: getPromoTheme(p.theme).grad } : undefined}
                >
                  {p.image ? <img src={p.image} alt="" /> : <span>{p.discountLabel || 'PROMO'}</span>}
                  {p.featured && (
                    <span className="adm-promo-star" title="Featured">
                      <AdminIcon name="star" size={12} filled />
                    </span>
                  )}
                </div>
                <div className="adm-promo-info">
                  <div className="adm-promo-title-row">
                    <h4>{p.title}</h4>
                    <StatusChip status={p.status} />
                  </div>
                  {p.subtitle && <p className="adm-promo-sub">{p.subtitle}</p>}
                  <div className="adm-promo-meta">
                    {p.price && <span className="adm-promo-price">{p.price}</span>}
                    <span>
                      <AdminIcon name="calendar" size={13} /> {p.startDate ? formatDate(p.startDate) : 'Now'} →{' '}
                      {p.endDate ? formatDate(p.endDate) : 'No end'}
                    </span>
                  </div>
                </div>
                <div className="adm-promo-actions">
                  <Switch checked={p.active} onChange={() => toggleActive(p)} />
                  <button
                    type="button"
                    className={`adm-icon-btn ${p.featured ? 'is-star' : ''}`}
                    title={p.featured ? 'Unfeature' : 'Make featured (large banner)'}
                    onClick={() => toggleFeatured(p)}
                  >
                    <AdminIcon name="star" size={16} filled={p.featured} />
                  </button>
                  <button type="button" className="adm-icon-btn" title="Edit" onClick={() => setEditing({ ...p })}>
                    <AdminIcon name="edit" size={16} />
                  </button>
                  <button type="button" className="adm-icon-btn" title="Duplicate" onClick={() => duplicate(p)}>
                    <AdminIcon name="copy" size={16} />
                  </button>
                  <button type="button" className="adm-icon-btn is-danger" title="Delete" onClick={() => handleDelete(p)}>
                    <AdminIcon name="trash" size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <PromotionEditor
          initial={editing}
          toast={toast}
          onClose={() => setEditing(null)}
          onSave={async (promo) => {
            await save(promo);
            toast(promo.id ? 'Promotion updated' : 'Promotion created');
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function PromotionEditor({ initial, onClose, onSave, toast }) {
  const { status: _s, ...clean } = initial;
  const [form, setForm] = useState(clean);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const uploadImage = async ([file]) => {
    try {
      set('image', await processImage(file, { maxSize: 1400 }));
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.startDate && form.endDate && form.endDate < form.startDate) e.endDate = 'End date must be after start date';
    if (form.ctaLink && !/^(https?:\/\/|tel:|mailto:|\/|#)/.test(form.ctaLink.trim()))
      e.ctaLink = 'Use a full link (https://…), tel:, mailto: or a page like /contact';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    await onSave({ ...form, title: form.title.trim(), ctaLink: form.ctaLink.trim() });
  };

  return (
    <Modal
      title={form.id ? 'Edit Promotion' : 'New Promotion'}
      subtitle="Fill in the details — the preview on the right shows exactly how it will look on your website."
      onClose={onClose}
      size="xl"
      footer={
        <>
          <Switch checked={form.active} onChange={(v) => set('active', v)} label={form.active ? 'Active' : 'Draft'} />
          <div className="adm-spacer" />
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="adm-btn adm-btn--primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : form.id ? 'Save Changes' : 'Publish Promotion'}
          </button>
        </>
      }
    >
      <div className="adm-editor">
        <div className="adm-form">
          <fieldset className="adm-fieldset">
            <legend>Content</legend>
            <label className="adm-field">
              <span className="adm-label">Promotion title *</span>
              <input
                className={`adm-input ${errors.title ? 'has-error' : ''}`}
                value={form.title}
                maxLength={80}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Black Friday Website Special"
              />
              {errors.title && <span className="adm-error">{errors.title}</span>}
            </label>
            <div className="adm-row">
              <label className="adm-field">
                <span className="adm-label">Small heading</span>
                <input className="adm-input" value={form.subtitle} maxLength={40} onChange={(e) => set('subtitle', e.target.value)} placeholder="e.g. Limited Offer" />
              </label>
              <label className="adm-field">
                <span className="adm-label">Badge</span>
                <input className="adm-input" value={form.badge} maxLength={18} onChange={(e) => set('badge', e.target.value)} placeholder="e.g. HOT, NEW" />
              </label>
            </div>
            <label className="adm-field">
              <span className="adm-label">Description</span>
              <textarea className="adm-input adm-textarea" rows={3} maxLength={280} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Explain what the promotion is and why customers should act now." />
              <span className="adm-hint">{form.description.length}/280</span>
            </label>
            <label className="adm-field">
              <span className="adm-label">What&apos;s included (one per line)</span>
              <textarea className="adm-input adm-textarea" rows={3} value={form.features} onChange={(e) => set('features', e.target.value)} placeholder={'Free domain for 1 year\nMobile-friendly design\n3 social media posts'} />
            </label>
          </fieldset>

          <fieldset className="adm-fieldset">
            <legend>Pricing</legend>
            <div className="adm-row adm-row--3">
              <label className="adm-field">
                <span className="adm-label">Offer price</span>
                <input className="adm-input" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="R299/mo" />
              </label>
              <label className="adm-field">
                <span className="adm-label">Old price</span>
                <input className="adm-input" value={form.oldPrice} onChange={(e) => set('oldPrice', e.target.value)} placeholder="R450/mo" />
              </label>
              <label className="adm-field">
                <span className="adm-label">Discount label</span>
                <input className="adm-input" value={form.discountLabel} maxLength={16} onChange={(e) => set('discountLabel', e.target.value)} placeholder="35% OFF" />
              </label>
            </div>
          </fieldset>

          <fieldset className="adm-fieldset">
            <legend>Image &amp; Style</legend>
            {form.image ? (
              <div className="adm-image-field">
                <img src={form.image} alt="" />
                <div>
                  <Dropzone onFiles={uploadImage} multiple={false} compact label="Replace image" />
                  <button type="button" className="adm-link is-danger" onClick={() => set('image', '')}>
                    Remove image
                  </button>
                </div>
              </div>
            ) : (
              <Dropzone onFiles={uploadImage} multiple={false} compact label="Upload promotion image (optional)" />
            )}
            <div className="adm-field">
              <span className="adm-label">Colour theme</span>
              <div className="adm-swatches">
                {PROMO_THEMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`adm-swatch ${form.theme === t ? 'is-active' : ''}`}
                    style={{ background: getPromoTheme(t).grad }}
                    onClick={() => set('theme', t)}
                    title={t}
                    aria-label={`${t} theme`}
                  />
                ))}
              </div>
            </div>
            <Switch checked={form.featured} onChange={(v) => set('featured', v)} label="Featured — show as large banner at the top" />
          </fieldset>

          <fieldset className="adm-fieldset">
            <legend>Button &amp; Schedule</legend>
            <div className="adm-row">
              <label className="adm-field">
                <span className="adm-label">Button text</span>
                <input className="adm-input" value={form.ctaText} maxLength={30} onChange={(e) => set('ctaText', e.target.value)} placeholder="Claim This Offer" />
              </label>
              <label className="adm-field">
                <span className="adm-label">Button link (optional)</span>
                <input className={`adm-input ${errors.ctaLink ? 'has-error' : ''}`} value={form.ctaLink} onChange={(e) => set('ctaLink', e.target.value)} placeholder="https://wa.me/27… or /contact" />
                {errors.ctaLink ? <span className="adm-error">{errors.ctaLink}</span> : <span className="adm-hint">Leave empty to open the &quot;Get Started&quot; popup</span>}
              </label>
            </div>
            <div className="adm-row">
              <label className="adm-field">
                <span className="adm-label">Start date</span>
                <input type="date" className="adm-input" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
                <span className="adm-hint">Empty = starts immediately</span>
              </label>
              <label className="adm-field">
                <span className="adm-label">End date</span>
                <input type="date" className={`adm-input ${errors.endDate ? 'has-error' : ''}`} value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
                {errors.endDate ? <span className="adm-error">{errors.endDate}</span> : <span className="adm-hint">Empty = never ends</span>}
              </label>
            </div>
          </fieldset>
        </div>

        <div className="adm-preview-pane">
          <div className="adm-preview-head">
            <span>Live preview</span>
            <StatusChip status={getPromotionStatus(form)} />
          </div>
          <div className="adm-preview-canvas">
            <PromoCard promo={form} preview />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default PromotionsManager;
