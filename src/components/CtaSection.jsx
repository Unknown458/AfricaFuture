function CtaSection({ onNavigate, onOpenGetStarted }) {
  const handleGetStarted = (e) => {
    e.preventDefault();
    if (onOpenGetStarted) {
      onOpenGetStarted();
    } else if (onNavigate) {
      onNavigate('/contact');
    }
  };

  return (
    <section id="contact" className="cta-section">
      <div className="container">
        <div className="cta-banner reveal">
          <div className="section-badge">
            <span className="badge-dot" />
            <span>Starting from R350 per month • Sign Up Today</span>
          </div>
          <h2
            className="section-title"
            style={{ maxWidth: '820px', margin: '0 auto 16px' }}
          >
            Your Business Deserves{' '}
            <span className="gradient-text">More Customers!</span>
          </h2>
          <p
            className="section-subtitle"
            style={{ maxWidth: '660px', margin: '0 auto 32px' }}
          >
            Sign Up with AfricaFuture Today and Let Us Help Your Business Grow.
            We bring your products closer to customers – and help bring
            customers to your store!
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="btn-orange btn-get-started-pulse"
              onClick={handleGetStarted}
            >
              <span>GET STARTED TODAY</span>
              <span>↗</span>
            </button>
            <a
              href="/contact"
              className="btn-secondary"
              onClick={(e) => {
                if (!onNavigate) return;
                e.preventDefault();
                onNavigate('/contact');
              }}
            >
              <span>Visit Contact Page</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
