function CtaSection({ onNavigate }) {
  const handleContactClick = (e) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate('/contact');
  };

  return (
    <section id="contact" className="cta-section">
      <div className="container">
        <div className="cta-banner reveal">
          <div className="section-badge">
            <span className="badge-dot" />
            <span>Ready to Launch with africafuture?</span>
          </div>
          <h2
            className="section-title"
            style={{ maxWidth: '780px', margin: '0 auto 16px' }}
          >
            Get Your Custom{' '}
            <span className="gradient-text">
              Website, App, or WhatsApp & Gmail API
            </span>{' '}
            Live
          </h2>
          <p
            className="section-subtitle"
            style={{ maxWidth: '620px', margin: '0 auto 32px' }}
          >
            Talk to our engineering team today for a live demo of our web/app
            development and automated communication APIs.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="/contact"
              className="btn-orange"
              onClick={handleContactClick}
            >
              <span>Consult our Experts</span>
              <span>↗</span>
            </a>
            <a href="#solutions" className="btn-secondary">
              <span>Explore APIs & Services</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
