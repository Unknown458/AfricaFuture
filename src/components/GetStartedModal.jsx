import { COMPANY_INFO, MAIN_THREE_PILLARS } from '../data/landingData';

function GetStartedModal({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  const handleContactPage = (e) => {
    e.preventDefault();
    onClose();
    if (onNavigate) {
      onNavigate('/contact');
    }
  };

  return (
    <div className="modal-backdrop get-started-backdrop" onClick={onClose}>
      <div
        className="modal-card get-started-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        <div className="get-started-badge">
          <span className="badge-dot" />
          <span>Starting from Just R350 / Month</span>
        </div>

        <h2 className="get-started-title">
          Grow Your Business with{' '}
          <span style={{ color: '#ff5510' }}>AfricaFuture!</span>
        </h2>

        <p className="get-started-subtitle">
          We bring your products closer to customers – and help bring customers
          to your store! Contact us directly below to get started today:
        </p>

        {/* Highlighted Phone Number Box */}
        <div className="dialog-highlight-phone-box">
          <div className="dialog-phone-label">
            📞 CALL OR WHATSAPP US DIRECTLY
          </div>
          <a href={`tel:${COMPANY_INFO.phone}`} className="dialog-phone-big">
            {COMPANY_INFO.phone}
          </a>
          <div className="dialog-phone-sub">
            Speak directly with our team • Fast setup from R350/month
          </div>
        </div>

        {/* Highlighted Address & Company Box */}
        <div className="dialog-highlight-address-box">
          <div className="dialog-address-icon">📍</div>
          <div>
            <div className="dialog-address-label">OUR OFFICE ADDRESS</div>
            <div className="dialog-company-name">{COMPANY_INFO.legalName}</div>
            <div className="dialog-address-text">{COMPANY_INFO.address}</div>
            <div className="dialog-email-text">✉️ {COMPANY_INFO.email}</div>
          </div>
        </div>

        {/* Highlighted Main 3 Sections */}
        <div className="dialog-pillars-wrap">
          <div className="dialog-pillars-heading">Our Main 3 Core Solutions:</div>
          <div className="dialog-pillars-grid">
            {MAIN_THREE_PILLARS.map((pillar) => (
              <div key={pillar.id} className="dialog-pillar-chip">
                <span className="dialog-pillar-num">{pillar.number}</span>
                <span>{pillar.tabTitle.replace(/^\d+\.\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dialog-actions-row">
          <a href={`tel:${COMPANY_INFO.phone}`} className="btn-orange">
            <span>📞 Call {COMPANY_INFO.phone} Now</span>
          </a>
          <a
            href="/contact"
            className="ritovex-dark-btn"
            onClick={handleContactPage}
          >
            <span>Send Online Enquiry ↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default GetStartedModal;

