function HeroBanner({ onNavigate }) {
  const handleConsultClick = (e) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate('/contact');
  };

  return (
    <section id="top" className="hero-banner">
      {/* Animated Ken Burns Image Background */}
      <div className="hero-bg-image" />
      <div className="hero-bg-overlay" />

      <div className="container">
        <div className="hero-clean-content reveal visible">
          <div className="hero-eyebrow">Services</div>

          <h1 className="hero-main-heading">
            Application Development
            <br />
            and Management
          </h1>

          <p className="hero-subtitle-lead">
            Improve IT agility, enhance CX through application modernization.
          </p>

          <div>
            <a
              href="/contact"
              className="btn-orange"
              onClick={handleConsultClick}
            >
              <span>Consult our Experts</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
