import { PROMO_PLATFORMS, WHY_CHOOSE_POINTS } from '../data/landingData';

function PlatformLogo({ id }) {
  switch (id) {
    case 'tiktok':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case 'facebook':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
    case 'website':
    default:
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
}

function RetailPromoSection({ onOpenGetStarted }) {
  return (
    <section id="digital-marketing" className="retail-promo-section">
      <div className="container">
        {/* Top Suggested Layout Card: Grow Your Business Online */}
        <div className="promo-showcase-banner reveal">
          <div className="promo-showcase-left">
            <div className="section-badge" style={{ marginBottom: '14px' }}>
              <span className="badge-dot" />
              <span>Retail & Business Growth Package</span>
            </div>

            <h2 className="promo-main-title">Grow Your Business Online</h2>

            <div className="promo-price-highlight">
              <span className="promo-price-tag">Starting from R350/month</span>
              <span className="promo-price-note">
                No expensive agencies • No complicated packages
              </span>
            </div>

            <p className="promo-lead-text">
              <strong>
                Promote your products. Reach more customers. Increase store
                visits.
              </strong>{' '}
              Get professional digital marketing support at a price that suits
              your business.
            </p>

            {/* Platform Icons Strip (Matching Suggested Layout Preview) */}
            <div className="promo-icons-strip">
              {PROMO_PLATFORMS.map((platform) => (
                <div key={platform.id} className="promo-icon-item">
                  <div
                    className="promo-app-icon"
                    style={{ background: platform.bgGradient }}
                  >
                    <PlatformLogo id={platform.id} />
                  </div>
                  <span className="promo-app-label">{platform.name}</span>
                </div>
              ))}
            </div>

            <div className="promo-cta-wrap">
              <button
                type="button"
                className="btn-orange btn-get-started-pulse"
                onClick={onOpenGetStarted}
              >
                <span>GET STARTED TODAY</span>
                <span>↗</span>
              </button>
              <span className="promo-cta-caption">
                Grow your business with AfricaFuture
              </span>
            </div>
          </div>

          {/* Right Tech & Digital Marketing Visual Card */}
          <div className="promo-showcase-right">
            <div className="promo-visual-frame">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85"
                alt="Digital marketing analytics and social media promotion technology"
                className="promo-visual-img"
              />
              <div className="promo-floating-badge">
                <div className="promo-floating-price">R350 / month</div>
                <div className="promo-floating-sub">
                  More Visibility • More Customers • More Sales
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* We Promote Your Business Across (5 Detailed Platform Cards) */}
        <div className="promo-platforms-block reveal">
          <div className="promo-sub-header">
            <h3 className="promo-sub-title">We Promote Your Business Across:</h3>
            <p className="promo-sub-desc">
              Multi-platform digital marketing designed to showcase your
              products and bring local customers directly to your store.
            </p>
          </div>

          <div className="promo-platforms-grid">
            {PROMO_PLATFORMS.map((platform, idx) => (
              <div
                key={platform.id}
                className={`promo-platform-card reveal delay-${(idx % 3) + 1}`}
              >
                <div
                  className="promo-platform-icon"
                  style={{ background: platform.bgGradient }}
                >
                  <PlatformLogo id={platform.id} />
                </div>
                <div className="promo-platform-tag">{platform.tagline}</div>
                <h4 className="promo-platform-name">{platform.name}</h4>
                <p className="promo-platform-desc">{platform.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose AfricaFuture + Your Business Deserves More Customers Split */}
        <div className="why-choose-grid reveal">
          <div className="why-choose-card">
            <div className="section-badge" style={{ marginBottom: '12px' }}>
              <span>Why Partner With Us</span>
            </div>
            <h3 className="why-choose-heading">Why Choose AfricaFuture?</h3>
            <p className="why-choose-intro">
              Affordable Monthly Subscription –{' '}
              <strong style={{ color: '#ff5510' }}>
                Starting from Just R350!
              </strong>{' '}
              No expensive marketing agencies. No complicated packages.
            </p>
            <ul className="why-choose-list">
              {WHY_CHOOSE_POINTS.map((point, index) => (
                <li key={index}>
                  <span className="why-check-badge">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="deserves-customers-card">
            <div className="deserves-price-pill">Starting from R350 per month</div>
            <h3 className="deserves-heading">
              Your Business Deserves More Customers!
            </h3>
            <p className="deserves-text">
              Sign Up with <strong>AfricaFuture</strong> Today and Let Us Help
              Your Business Grow.
            </p>
            <p className="deserves-highlight">
              “We bring your products closer to customers – and help bring
              customers to your store!”
            </p>
            <div>
              <button
                type="button"
                className="btn-orange btn-get-started-pulse"
                onClick={onOpenGetStarted}
              >
                <span>GET STARTED TODAY — CLICK ME</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RetailPromoSection;

