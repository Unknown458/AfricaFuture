import { useState } from 'react';
import { MAIN_THREE_PILLARS } from '../data/landingData';

function AdmTabsSection({ onOpenGetStarted }) {
  const [activeTab, setActiveTab] = useState(0);
  const currentTab = MAIN_THREE_PILLARS[activeTab];

  return (
    <section id="adm" className="adm-tabs-section">
      <div className="container">
        <div className="section-header reveal" style={{ marginBottom: '28px' }}>
          <div className="section-badge">
            <span className="badge-dot" />
            <span>Our Main 3 Core Pillars</span>
          </div>
          <h2 className="section-title">
            1. Digital Marketing • 2. Website Development •{' '}
            <span className="gradient-text">3. Software Application</span>
          </h2>
        </div>

        <div className="adm-top-bar reveal">
          {MAIN_THREE_PILLARS.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              className={`adm-tab-link ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.tabTitle}
            </button>
          ))}
        </div>

        <div className="adm-tab-content-single reveal">
          <div className="pillar-badge-inline">{currentTab.badge}</div>
          <h3 className="adm-tab-heading">{currentTab.heading}</h3>
          <p className="adm-tab-desc">{currentTab.description}</p>

          {currentTab.highlights && (
            <ul className="pillar-highlights-list">
              {currentTab.highlights.map((item, idx) => (
                <li key={idx}>
                  <span className="feature-check">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            className="btn-orange"
            onClick={onOpenGetStarted}
          >
            <span>GET STARTED TODAY</span>
            <span>↗</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default AdmTabsSection;
