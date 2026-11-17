import { useEffect, useRef, useState } from 'react';
import AdminIcon from './AdminIcon';
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_MB } from '../services/contentStore';

/** Drag & drop / click-to-browse image picker. */
export function Dropzone({ onFiles, multiple = true, compact = false, label }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handle = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length) onFiles(multiple ? files : [files[0]]);
  };

  return (
    <div
      className={`adm-dropzone ${drag ? 'is-drag' : ''} ${compact ? 'is-compact' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple={multiple}
        hidden
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = '';
        }}
      />
      <div className="adm-dropzone-icon">
        <AdminIcon name="upload" size={compact ? 20 : 28} />
      </div>
      <div className="adm-dropzone-text">
        <strong>{label || (multiple ? 'Drop images here or click to browse' : 'Drop an image or click to browse')}</strong>
        <span>JPG, PNG, WEBP or GIF · up to {MAX_UPLOAD_MB}MB each</span>
      </div>
    </div>
  );
}

/** Generic modal shell. */
export function Modal({ title, subtitle, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="adm-modal-backdrop" onMouseDown={onClose}>
      <div className={`adm-modal adm-modal--${size}`} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="adm-modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close">
            <AdminIcon name="close" />
          </button>
        </header>
        <div className="adm-modal-body">{children}</div>
        {footer && <footer className="adm-modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

/** Toggle switch. */
export function Switch({ checked, onChange, label }) {
  return (
    <label className="adm-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="adm-switch-track">
        <span className="adm-switch-thumb" />
      </span>
      {label && <span className="adm-switch-label">{label}</span>}
    </label>
  );
}

/** Empty state block. */
export function EmptyState({ icon = 'gallery', title, text, action }) {
  return (
    <div className="adm-empty">
      <div className="adm-empty-icon">
        <AdminIcon name={icon} size={30} />
      </div>
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

const STATUS_META = {
  live: { label: 'Live', className: 'is-live' },
  scheduled: { label: 'Scheduled', className: 'is-scheduled' },
  expired: { label: 'Expired', className: 'is-expired' },
  draft: { label: 'Draft', className: 'is-draft' },
};

export function StatusChip({ status }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  return <span className={`adm-status ${meta.className}`}>{meta.label}</span>;
}
