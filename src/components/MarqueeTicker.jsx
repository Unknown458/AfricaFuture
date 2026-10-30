import { MARQUEE_ITEMS } from '../data/landingData';

function MarqueeTicker() {
  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
          <div className="marquee-item" key={idx}>
            <span className="marquee-star">✦</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarqueeTicker;

