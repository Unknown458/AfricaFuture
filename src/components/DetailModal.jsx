function DetailModal({ item, onClose, onNavigate }) {
  if (!item) return null;

  const handleConsultClick = (e) => {
    e.preventDefault();
    onClose();
    if (onNavigate) {
      onNavigate('/contact');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="section-badge">
          <span>{item.eyebrow || `africafuture Capability /${item.id}`}</span>
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            marginBottom: '14px',
          }}
        >
          {item.title}
        </h3>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '22px',
            lineHeight: '1.7',
          }}
        >
          {item.description || item.summary}
        </p>
        {item.features && (
          <ul className="service-features" style={{ marginBottom: '24px' }}>
            {item.features.map((f, i) => (
              <li key={i}>
                <span className="feature-check">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
        <a href="/contact" className="btn-orange" onClick={handleConsultClick}>
          <span>Consult our Experts</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  );
}

export default DetailModal;
