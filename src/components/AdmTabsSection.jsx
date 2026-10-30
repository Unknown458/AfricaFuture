import { useState } from 'react';
import { ADM_TABS } from '../data/landingData';

function AdmTabsSection() {
  const [activeAdmTab, setActiveAdmTab] = useState(0);
  const currentTab = ADM_TABS[activeAdmTab];

  return (
    <section id="adm" className="adm-tabs-section">
      <div className="container">
        <div className="adm-top-bar reveal">
          {ADM_TABS.map((tab, index) => (
            <button
              key={tab.id}
              className={`adm-tab-link ${activeAdmTab === index ? 'active' : ''}`}
              onClick={() => setActiveAdmTab(index)}
            >
              {tab.tabTitle}
            </button>
          ))}
        </div>

        <div className="adm-tab-content-single reveal">
          <h2 className="adm-tab-heading">{currentTab.heading}</h2>
          <p className="adm-tab-desc">{currentTab.description}</p>
          <a href="#solutions" className="btn-orange">
            <span>Learn more about our service offerings</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default AdmTabsSection;

