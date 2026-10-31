import { useEffect, useRef, useState } from 'react';
import { ABOUT_STATS, COMPANY_PHONE } from '../data/landingData';

function StatIcon({ type }) {
  switch (type) {
    case 'folder':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'trophy':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      );
    case 'users':
    default:
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
  }
}

function CountUpNumber({ target, prefix = '', suffix = '', active }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const duration = 1500;
    let frameId;

    const animate = (timestamp) => {
      if (!active) {
        setCount(0);
        return;
      }
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [active, target]);

  return (
    <span className="ritovex-stat-number">
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

function AboutUsSection({ onOpenGetStarted }) {
  const sectionRef = useRef(null);
  const [separated, setSeparated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeparated(true);
        } else {
          setSeparated(false);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className={`ritovex-about-section ${separated ? 'section-active' : ''}`}
    >
      <div className="container">
        <div className="ritovex-about-header">
          <div className="ritovex-about-pill">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>About AfricaFuture</span>
          </div>

          <h2 className="ritovex-about-title">
            Your Complete Digital Marketing, Website & Software Partner
          </h2>

          <p className="ritovex-about-subtitle">
            We help retailers and businesses across South Africa promote their
            products on TikTok, Instagram, Facebook, and WhatsApp, build
            professional websites, and deploy custom software applications—starting
            from just R350/month.
          </p>
        </div>

        {/* Two-Column Content: Left IT Tech Image + Right Scroll-Animated 2x2 Stats Grid */}
        <div className="ritovex-about-grid">
          <div className="ritovex-portrait-wrapper">
            <div className="ritovex-cutout-frame">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85"
                alt="AfricaFuture - Your Complete Digital Marketing, Website & Software Partner Team"
                className="ritovex-portrait-img"
              />
              <div className="cutout-notch notch-top-right" />
              <div className="cutout-notch notch-bottom-left" />
            </div>
          </div>

          <div className="ritovex-stats-column">
            <div
              className={`ritovex-stats-grid ${
                separated ? 'cards-separated' : 'cards-stacked'
              }`}
            >
              {ABOUT_STATS.map((stat, idx) => (
                <div
                  key={stat.id}
                  className={`ritovex-stat-card stat-card-${idx + 1}`}
                >
                  <div className="ritovex-stat-top">
                    <span className="ritovex-stat-icon">
                      <StatIcon type={stat.iconType} />
                    </span>
                    <CountUpNumber
                      target={stat.target}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      active={separated}
                    />
                  </div>
                  <div className="ritovex-stat-divider" />
                  <p className="ritovex-stat-label">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="ritovex-about-actions">
              <button
                type="button"
                className="ritovex-dark-btn"
                onClick={onOpenGetStarted}
              >
                GET STARTED TODAY
              </button>

              <a href={`tel:${COMPANY_PHONE}`} className="ritovex-quote-call">
                <span className="quote-phone-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <div>
                  <div className="quote-small-text">Call Us Directly</div>
                  <div className="quote-phone-number">{COMPANY_PHONE}</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUsSection;
