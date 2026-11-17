import PromoCard from './PromoCard';
import { getPromotionStatus } from '../services/contentStore';

/**
 * Public "Current Promotions" section.
 * Shows only promotions that are Live (active + inside their date range).
 * Renders nothing when there are no live promotions.
 */
function PromotionsSection({ promotions = [], onOpenGetStarted }) {
  const live = promotions.filter((p) => getPromotionStatus(p) === 'live');
  if (live.length === 0) return null;

  const featured = live.find((p) => p.featured);
  const rest = live.filter((p) => p !== featured);

  return (
    <section id="promotions" className="site-promotions-section">
      <div className="container">
        <div className="site-section-head reveal">
          <div className="section-badge">
            <span className="badge-dot" />
            <span>Limited Time Offers</span>
          </div>
          <h2 className="site-section-title">
            Current <span className="text-gradient-orange">Promotions</span>
          </h2>
          <p className="site-section-sub">
            Don&apos;t miss out on our latest deals and special packages — grab them
            while they last.
          </p>
        </div>

        {featured && (
          <div className="reveal">
            <PromoCard promo={featured} featured onCta={onOpenGetStarted} />
          </div>
        )}

        {rest.length > 0 && (
          <div className="site-promotions-grid">
            {rest.map((promo, idx) => (
              <div key={promo.id} className={`reveal delay-${(idx % 3) + 1}`}>
                <PromoCard promo={promo} onCta={onOpenGetStarted} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PromotionsSection;
