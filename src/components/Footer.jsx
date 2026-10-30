import { COMPANY_INFO } from '../data/landingData';

function Footer({ onNavigate }) {
  const handleNav = (e, path, hash = '') => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(path, hash);
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
            <h4>ADM Services</h4>
            <ul>
              <li>
                <a href="/#adm" onClick={(e) => handleNav(e, '/', '#adm')}>
                  Application & Platform Dev
                </a>
              </li>
              <li>
                <a href="/#adm" onClick={(e) => handleNav(e, '/', '#adm')}>
                  Application Modernization
                </a>
              </li>
              <li>
                <a href="/#adm" onClick={(e) => handleNav(e, '/', '#adm')}>
                  Maintenance & Support
                </a>
              </li>
              <li>
                <a href="/#adm" onClick={(e) => handleNav(e, '/', '#adm')}>
                  Portfolio Rationalization
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Products & APIs</h4>
            <ul>
              <li>
                <a
                  href="/#solutions"
                  onClick={(e) => handleNav(e, '/', '#solutions')}
                >
                  Custom Websites & Web Apps
                </a>
              </li>
              <li>
                <a
                  href="/#solutions"
                  onClick={(e) => handleNav(e, '/', '#solutions')}
                >
                  iOS & Android Mobile Apps
                </a>
              </li>
              <li>
                <a
                  href="/#solutions"
                  onClick={(e) => handleNav(e, '/', '#solutions')}
                >
                  WhatsApp Business Cloud API
                </a>
              </li>
              <li>
                <a
                  href="/#solutions"
                  onClick={(e) => handleNav(e, '/', '#solutions')}
                >
                  Gmail & Workspace API
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
                <a href="/#about" onClick={(e) => handleNav(e, '/', '#about')}>
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
            © {new Date().getFullYear()} {COMPANY_INFO.legalName}. All rights
            reserved.
          </span>
          <span>{COMPANY_INFO.address}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
