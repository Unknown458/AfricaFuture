function HeroBanner({ onNavigate, onOpenGetStarted }) {
  const handleGetStarted = (e) => {
    e.preventDefault();
    if (onOpenGetStarted) {
      onOpenGetStarted();
    } else if (onNavigate) {
      onNavigate('/contact');
    }
  };

  return (
    <section id="top" className="hero-banner">
      {/* Animated Ken Burns Image Background */}
      <div className="hero-bg-image" />
      <div className="hero-bg-overlay" />

      <div className="container">
        <div className="hero-clean-content reveal visible">
          <div className="hero-eyebrow">
            Digital Marketing • Website Development • Software Application
          </div>

          <h1 className="hero-main-heading">
            Grow Your Retail Business
            <br />
            with <span style={{ color: '#ff6a2b' }}>AfricaFuture</span>
          </h1>

          <p className="hero-subtitle-lead">
            More Visibility. More Customers. More Sales.
          </p>

          <div>
            <button
              type="button"
              className="btn-orange"
              onClick={handleGetStarted}
            >
              <span>GET STARTED TODAY</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
