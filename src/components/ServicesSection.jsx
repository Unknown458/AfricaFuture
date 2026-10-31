import { CORE_SERVICES } from '../data/landingData';

function ServicesSection({ onSelectService }) {
  return (
    <section id="solutions" className="api-studio-section">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-badge">
            <span className="badge-dot" />
            <span>AfricaFuture Complete Growth & Tech Suite</span>
          </div>
          <h2 className="section-title">
            Digital Marketing,{' '}
            <span className="gradient-text">
              Websites & Software Applications
            </span>{' '}
            Built for Growth
          </h2>
          <p className="section-subtitle">
            From our affordable R350/month retail digital marketing plans across
            TikTok, Instagram, Facebook & WhatsApp to custom websites and
            business software applications.
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
                  type="button"
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
