import { useMemo, useState } from 'react';
import AdminIcon from './AdminIcon';
import { Dropzone, EmptyState, Modal, Switch } from './AdminUI';
import { formatDate } from './formatDate';
import {
  dataUrlSizeKb,
  deleteGalleryItem,
  processImage,
  saveGalleryItem,
} from '../services/contentStore';

const DEFAULT_CATEGORIES = ['Products', 'Projects', 'Store', 'Events', 'Team'];

const titleFromFile = (name) =>
  name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

function GalleryManager({ gallery, toast, confirm }) {
  const [uploadCategory, setUploadCategory] = useState('Products');
  const [uploading, setUploading] = useState(null); // { done, total }
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);

  const categories = useMemo(
    () => [...new Set([...DEFAULT_CATEGORIES, ...gallery.map((g) => g.category).filter(Boolean)])],
    [gallery]
  );

  const filtered = gallery.filter((g) => {
    const q = search.trim().toLowerCase();
    const matchQ = !q || `${g.title} ${g.caption} ${g.category}`.toLowerCase().includes(q);
    const matchC = filter === 'All' || g.category === filter;
    return matchQ && matchC;
  });

  const handleFiles = async (files) => {
    setUploading({ done: 0, total: files.length });
    let ok = 0;
    const errors = [];
    const baseOrder = gallery.length;
    for (let i = 0; i < files.length; i += 1) {
      try {
        const src = await processImage(files[i]);
        await saveGalleryItem({
          src,
          title: titleFromFile(files[i].name),
          caption: '',
          category: uploadCategory,
          visible: true,
          order: baseOrder + i,
        });
        ok += 1;
      } catch (err) {
        errors.push(err.message);
      }
      setUploading({ done: i + 1, total: files.length });
    }
    setUploading(null);
    if (ok) toast(`${ok} image${ok > 1 ? 's' : ''} uploaded successfully`);
    errors.forEach((e) => toast(e, 'error'));
  };

  const toggleVisible = async (item) => {
    await saveGalleryItem({ ...item, visible: item.visible === false });
    toast(item.visible === false ? 'Image is now visible on the website' : 'Image hidden from the website');
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: 'Delete image?',
      text: `"${item.title || 'Untitled'}" will be permanently removed from your website.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    await deleteGalleryItem(item.id);
    setSelected((s) => s.filter((id) => id !== item.id));
    toast('Image deleted');
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: `Delete ${selected.length} images?`,
      text: 'The selected images will be permanently removed from your website.',
      confirmText: 'Delete all',
      danger: true,
    });
    if (!ok) return;
    await Promise.all(selected.map((id) => deleteGalleryItem(id)));
    toast(`${selected.length} images deleted`);
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

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="adm-stack">
      {/* Upload card */}
      <section className="adm-card">
        <div className="adm-card-head">
          <div>
            <h3>Upload New Images</h3>
            <p className="adm-muted">Images are optimised automatically and appear in the website gallery.</p>
          </div>
          <label className="adm-inline-field">
            <span>Category</span>
            <select className="adm-input adm-select" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        {uploading ? (
          <div className="adm-progress-box">
            <div className="adm-progress-text">
              <span className="adm-spinner adm-spinner--dark" />
              Uploading {uploading.done} of {uploading.total}…
            </div>
            <div className="adm-progress">
              <div className="adm-progress-bar" style={{ width: `${(uploading.done / uploading.total) * 100}%` }} />
            </div>
          </div>
        ) : (
          <Dropzone onFiles={handleFiles} />
        )}
      </section>

      {/* Library */}
      <section className="adm-card">
        <div className="adm-card-head adm-card-head--wrap">
          <div>
            <h3>Image Library</h3>
            <p className="adm-muted">
              {gallery.length} image{gallery.length !== 1 ? 's' : ''} · {gallery.filter((g) => g.visible !== false).length} visible
            </p>
          </div>
          <div className="adm-toolbar">
            <div className="adm-search">
              <AdminIcon name="search" size={16} />
              <input placeholder="Search images…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="adm-input adm-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
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

        {filtered.length === 0 ? (
          <EmptyState
            icon="gallery"
            title={gallery.length ? 'No images match your search' : 'Your gallery is empty'}
            text={gallery.length ? 'Try a different search or category.' : 'Upload images above and they will show here.'}
          />
        ) : (
          <div className="adm-media-grid">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`adm-media-card ${item.visible === false ? 'is-hidden' : ''} ${selected.includes(item.id) ? 'is-selected' : ''}`}
              >
                <div className="adm-media-thumb">
                  <img src={item.src} alt={item.title} loading="lazy" />
                  <label className="adm-media-select" title="Select">
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} />
                  </label>
                  {item.visible === false && <span className="adm-media-flag">Hidden</span>}
                  <div className="adm-media-actions">
                    <button type="button" className="adm-icon-btn" title="Edit" onClick={() => setEditing({ ...item })}>
                      <AdminIcon name="edit" size={16} />
                    </button>
                    <button
                      type="button"
                      className="adm-icon-btn"
                      title={item.visible === false ? 'Show on website' : 'Hide from website'}
                      onClick={() => toggleVisible(item)}
                    >
                      <AdminIcon name={item.visible === false ? 'eyeOff' : 'eye'} size={16} />
                    </button>
                    <button type="button" className="adm-icon-btn is-danger" title="Delete" onClick={() => handleDelete(item)}>
                      <AdminIcon name="trash" size={16} />
                    </button>
                  </div>
                </div>
                <div className="adm-media-info">
                  <strong title={item.title}>{item.title || 'Untitled'}</strong>
                  <div className="adm-media-meta">
                    <span className="adm-tag">{item.category || 'Uncategorised'}</span>
                    {filter === 'All' && !search && (
                      <span className="adm-order-btns">
                        <button type="button" title="Move left" onClick={() => move(item, -1)}>‹</button>
                        <button type="button" title="Move right" onClick={() => move(item, 1)}>›</button>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <EditImageModal
          item={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={async (updated) => {
            await saveGalleryItem(updated);
            setEditing(null);
            toast('Image details saved');
          }}
          toast={toast}
        />
      )}
    </div>
  );
}

function EditImageModal({ item, categories, onClose, onSave, toast }) {
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const replace = async ([file]) => {
    try {
      set('src', await processImage(file));
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <Modal
      title="Edit Image"
      subtitle={`Uploaded ${formatDate(item.createdAt)} · ${dataUrlSizeKb(form.src)} KB`}
      onClose={onClose}
      size="lg"
      footer={
        <>
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
          <img src={form.src} alt={form.title} />
          <Dropzone onFiles={replace} multiple={false} compact label="Replace image" />
        </div>
        <div className="adm-form">
          <label className="adm-field">
            <span className="adm-label">Title</span>
            <input className="adm-input" value={form.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="e.g. New summer collection" />
          </label>
          <label className="adm-field">
            <span className="adm-label">Category</span>
            <input className="adm-input" list="adm-cat-list" value={form.category || ''} onChange={(e) => set('category', e.target.value)} placeholder="Choose or type a new category" />
            <datalist id="adm-cat-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="adm-field">
            <span className="adm-label">Caption / Description</span>
            <textarea className="adm-input adm-textarea" rows={4} value={form.caption || ''} onChange={(e) => set('caption', e.target.value)} placeholder="Shown when visitors open the image" />
          </label>
          <Switch checked={form.visible !== false} onChange={(v) => set('visible', v)} label="Show this image on the website" />
        </div>
      </div>
    </Modal>
  );
}

export default GalleryManager;
