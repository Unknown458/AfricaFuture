import { useState, useEffect } from 'react';
import { COMPANY_PHONE } from '../data/landingData';

function Navbar({ currentPath = '/', onNavigate }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e, path) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a
        href="/"
        className="brand-logo"
        onClick={(e) => handleLinkClick(e, '/')}
      >
        <span className="logo-mark">AF</span>
        <span>
          africa<span style={{ color: '#ff5510' }}>future</span>
        </span>
      </a>

      <nav className="nav-links">
        <a
          href="/about"
          className={`nav-link ${currentPath === '/about' ? 'active-route' : ''}`}
          onClick={(e) => handleLinkClick(e, '/about')}
        >
          About Us
        </a>
        <a
          href="/services"
          className={`nav-link ${currentPath === '/services' ? 'active-route' : ''}`}
          onClick={(e) => handleLinkClick(e, '/services')}
        >
          Services
        </a>
        <a
          href="/digital-marketing"
          className={`nav-link ${currentPath === '/digital-marketing' ? 'active-route' : ''}`}
          onClick={(e) => handleLinkClick(e, '/digital-marketing')}
        >
          Digital Marketing
        </a>
        <a
          href="/client-success"
          className={`nav-link ${currentPath === '/client-success' ? 'active-route' : ''}`}
          onClick={(e) => handleLinkClick(e, '/client-success')}
        >
          Client Success
        </a>
        <a
          href="/contact"
          className={`nav-link ${currentPath === '/contact' ? 'active-route' : ''}`}
          onClick={(e) => handleLinkClick(e, '/contact')}
        >
          Contact
        </a>
      </nav>

      <div className="nav-actions">
        <a
          href={`tel:${COMPANY_PHONE}`}
          className="header-phone-pill"
          title="Call Us Directly"
        >
          <span className="phone-ring-icon">📞</span>
          <span>
            Contact Us: <strong>{COMPANY_PHONE}</strong>
          </span>
        </a>
      </div>
    </header>
  );
}

export default Navbar;
