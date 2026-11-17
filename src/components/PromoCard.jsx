import '../styles/content.css';

import { getPromoTheme } from '../data/promoThemes';

function daysLeft(endDate) {
  if (!endDate) return null;
  const end = new Date(`${endDate}T23:59:59`);
  const diff = Math.ceil((end - new Date()) / 864e5);
  return diff;
}

function EndsChip({ endDate }) {
  const d = daysLeft(endDate);
  if (d === null || d < 0) return null;
  const label = d === 0 ? 'Ends today' : d === 1 ? 'Ends tomorrow' : `Ends in ${d} days`;
  return (
    <span className={`promo-card-ends ${d <= 3 ? 'is-urgent' : ''}`}>
      <span className="promo-card-ends-dot" />
      {label}
    </span>
  );
}

/**
 * Promotion card used on the public website AND as the live preview
 * inside the admin panel, so the admin always sees exactly what
 * visitors will see.
 */
function PromoCard({ promo, featured = false, onCta, preview = false }) {
  const theme = getPromoTheme(promo.theme);
  const features = (promo.features || '')
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  const ctaText = promo.ctaText || 'Claim This Offer';
  const useLink = Boolean(promo.ctaLink) && !preview;

  const cta = useLink ? (
      <a
        className="promo-card-cta"
        style={{ background: theme.grad }}
        href={promo.ctaLink}
        target={promo.ctaLink.startsWith('http') ? '_blank' : undefined}
        rel="noreferrer"
      >
        <span>{ctaText}</span>
        <span>↗</span>
      </a>
    ) : (
      <button type="button" className="promo-card-cta" style={{ background: theme.grad }} onClick={preview ? undefined : onCta}>
        <span>{ctaText}</span>
        <span>↗</span>
      </button>
    );

  return (
    <article
      className={`promo-card ${featured ? 'promo-card--featured' : ''}`}
      style={{ '--promo-accent': theme.accent }}
    >
      <div className="promo-card-media" style={!promo.image ? { background: theme.grad } : undefined}>
        {promo.image ? (
          <img src={promo.image} alt={promo.title || 'Promotion'} loading="lazy" />
        ) : (
          <div className="promo-card-media-placeholder">
            <span>{promo.discountLabel || 'SPECIAL OFFER'}</span>
          </div>
        )}
        {promo.badge && <span className="promo-card-badge">{promo.badge}</span>}
        {promo.discountLabel && promo.image && (
          <span className="promo-card-ribbon" style={{ background: theme.grad }}>
            {promo.discountLabel}
          </span>
        )}
      </div>

      <div className="promo-card-body">
        <div className="promo-card-top">
          {promo.subtitle && <span className="promo-card-kicker">{promo.subtitle}</span>}
          <EndsChip endDate={promo.endDate} />
        </div>

        <h3 className="promo-card-title">{promo.title || 'Your promotion title'}</h3>

        {promo.description && <p className="promo-card-desc">{promo.description}</p>}

        {features.length > 0 && (
          <ul className="promo-card-features">
            {features.map((f, i) => (
              <li key={i}>
                <span className="promo-card-check">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="promo-card-footer">
          {(promo.price || promo.oldPrice) && (
            <div className="promo-card-price">
              {promo.oldPrice && <span className="promo-card-old">{promo.oldPrice}</span>}
              {promo.price && <span className="promo-card-new">{promo.price}</span>}
            </div>
          )}
          {cta}
        </div>
      </div>
    </article>
  );
}

export default PromoCard;
