import { useEffect, useMemo, useState } from 'react';
import '../styles/content.css';

/**
 * Public gallery fed by images uploaded in the admin panel.
 * Includes category filters and a keyboard-friendly lightbox.
 */
function GallerySection({ gallery = [] }) {
  const visible = useMemo(() => gallery.filter((g) => g.visible !== false), [gallery]);
  const categories = useMemo(
    () => ['All', ...new Set(visible.map((g) => g.category).filter(Boolean))],
    [visible]
  );
  const [active, setActive] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const items = active === 'All' ? visible : visible.filter((g) => g.category === active);

  useEffect(() => {
    if (lightbox === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox((i) => (i + 1) % items.length);
      if (e.key === 'ArrowLeft') setLightbox((i) => (i - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, items.length]);

  if (visible.length === 0) return null;
  const current = lightbox !== null ? items[lightbox] : null;

  return (
    <section id="gallery" className="site-gallery-section">
      <div className="container">
        <div className="site-section-head reveal">
          <div className="section-badge">
            <span className="badge-dot" />
            <span>Our Work</span>
          </div>
          <h2 className="site-section-title">
            Project <span className="text-gradient-orange">Gallery</span>
          </h2>
          <p className="site-section-sub">
            A look at the products, campaigns and projects we&apos;re proud of.
          </p>
        </div>

        {categories.length > 2 && (
          <div className="site-gallery-filters reveal">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`site-gallery-filter ${active === c ? 'is-active' : ''}`}
                onClick={() => setActive(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="site-gallery-grid">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className="site-gallery-item"
              onClick={() => setLightbox(idx)}
            >
              <img src={item.src} alt={item.title || 'Gallery image'} loading="lazy" />
              <div className="site-gallery-overlay">
                {item.category && <span className="site-gallery-cat">{item.category}</span>}
                {item.title && <h4>{item.title}</h4>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {current && (
        <div className="site-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <button type="button" className="site-lightbox-close" aria-label="Close" onClick={() => setLightbox(null)}>
            ✕
          </button>
          {items.length > 1 && (
            <>
              <button
                type="button"
                className="site-lightbox-nav prev"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => (i - 1 + items.length) % items.length);
                }}
              >
                ‹
              </button>
              <button
                type="button"
                className="site-lightbox-nav next"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => (i + 1) % items.length);
                }}
              >
                ›
              </button>
            </>
          )}
          <figure className="site-lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img src={current.src} alt={current.title || 'Gallery image'} />
            {(current.title || current.caption) && (
              <figcaption>
                {current.title && <strong>{current.title}</strong>}
                {current.caption && <span>{current.caption}</span>}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </section>
  );
}

export default GallerySection;
