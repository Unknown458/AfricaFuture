import { CORE_SERVICES } from '../data/landingData';

function ServicesSection({ onSelectService }) {
  return (
    <section id="solutions" className="api-studio-section">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-badge">
            <span className="badge-dot" />
            <span>africafuture Core IT & API Offerings</span>
          </div>
          <h2 className="section-title">
            Websites, Mobile Apps &{' '}
            <span className="gradient-text">WhatsApp / Gmail APIs</span> Built
            for Scale
          </h2>
          <p className="section-subtitle">
            Everything your business needs in one IT partner—from custom
            full-stack websites and mobile apps to plug-and-play WhatsApp
            Business & Gmail API integrations.
          </p>
        </div>

        <div className="services-grid">
          {CORE_SERVICES.map((service, idx) => (
            <div
              key={service.id}
              className={`service-card reveal delay-${(idx % 3) + 1}`}
            >
              <div>
                <div className="service-top">
                  <div className="service-icon-box">{service.icon}</div>
                  <span className="service-number">/{service.id}</span>
                </div>

                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.description}</p>

                <ul className="service-features">
                  {service.features.map((feat, i) => (
                    <li key={i}>
                      <span className="feature-check">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="service-footer">
                <span className="service-metric">{service.metric}</span>
                <button
                  className="service-link"
                  onClick={() => onSelectService(service)}
                >
                  <span>View Details</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;

