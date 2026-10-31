import { COMPANY_INFO } from '../data/landingData';

const CURRENT_YEAR = new Date().getFullYear();

function Footer({ onNavigate }) {
  const handleNav = (e, path) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div
              className="brand-logo"
              style={{ marginBottom: '12px', color: '#ffffff', marginLeft: 0 }}
            >
              <span className="logo-mark">AF</span>
              <span>
                africa<span style={{ color: '#ff5510' }}>future</span>
              </span>
            </div>
            <p
              style={{
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.88rem',
                marginBottom: '8px',
              }}
            >
              {COMPANY_INFO.legalName}
            </p>
            <p
              style={{
                color: '#a2a8c3',
                fontSize: '0.86rem',
                maxWidth: '320px',
                marginBottom: '10px',
              }}
            >
              📍 {COMPANY_INFO.address}
            </p>
            <p style={{ color: '#ff7733', fontSize: '0.9rem', fontWeight: 700 }}>
              📞 {COMPANY_INFO.phone}
            </p>
          </div>

          <div className="footer-col">
            <h4>Main 3 Solutions</h4>
            <ul>
              <li>
                <a
                  href="/digital-marketing"
                  onClick={(e) => handleNav(e, '/digital-marketing')}
                >
                  1. Digital Marketing (From R350/mo)
                </a>
              </li>
              <li>
                <a href="/services" onClick={(e) => handleNav(e, '/services')}>
                  2. Website Development
                </a>
              </li>
              <li>
                <a href="/services" onClick={(e) => handleNav(e, '/services')}>
                  3. Software Application
                </a>
              </li>
              <li>
                <a
                  href="/solutions"
                  onClick={(e) => handleNav(e, '/solutions')}
                >
                  WhatsApp & Gmail APIs
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>We Promote Across</h4>
            <ul>
              <li>
                <a
                  href="/digital-marketing"
                  onClick={(e) => handleNav(e, '/digital-marketing')}
                >
                  TikTok Promotional Videos
                </a>
              </li>
              <li>
                <a
                  href="/digital-marketing"
                  onClick={(e) => handleNav(e, '/digital-marketing')}
                >
                  Instagram Product Showcase
                </a>
              </li>
              <li>
                <a
                  href="/digital-marketing"
                  onClick={(e) => handleNav(e, '/digital-marketing')}
                >
                  Facebook Local Reach
                </a>
              </li>
              <li>
                <a
                  href="/digital-marketing"
                  onClick={(e) => handleNav(e, '/digital-marketing')}
                >
                  WhatsApp & Your Own Website
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/" onClick={(e) => handleNav(e, '/')}>
                  Home Page
                </a>
              </li>
              <li>
                <a href="/about" onClick={(e) => handleNav(e, '/about')}>
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleNav(e, '/contact')}
                >
                  Contact Us Page
                </a>
              </li>
              <li>
                <a href={`tel:${COMPANY_INFO.phone}`}>
                  Call: {COMPANY_INFO.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {CURRENT_YEAR} {COMPANY_INFO.legalName}. All rights reserved.
          </span>
          <span>{COMPANY_INFO.address}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
