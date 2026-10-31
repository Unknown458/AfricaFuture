import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { COMPANY_INFO } from '../data/landingData';
import { useScrollReveal } from '../hooks/useScrollReveal';

function ContactPage({ currentPath, onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useScrollReveal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        budget: '',
        message: '',
      });
    }, 4000);
  };

  return (
    <div className="app-wrapper contact-page-wrapper">
      <Navbar currentPath={currentPath} onNavigate={onNavigate} />

      <section className="contact-hero-section">
        <div className="container">
          <div className="contact-hero-inner reveal visible">
            <div className="section-badge" style={{ marginBottom: '14px' }}>
              <span className="badge-dot" />
              <span>Starting from R350 / Month • Digital Marketing, Websites & Software</span>
            </div>
            <h1 className="contact-main-title">Contact Us</h1>
            <p className="contact-main-subtitle">
              Partner with <strong>{COMPANY_INFO.legalName}</strong> for{' '}
              <strong>1. Digital Marketing</strong> (TikTok, Instagram, Facebook &
              WhatsApp starting from R350/month),{' '}
              <strong>2. Website Development</strong>, and{' '}
              <strong>3. Software Applications</strong>. Reach out to our
              Johannesburg team today!
            </p>
          </div>
        </div>
      </section>

      {/* Middle Soft-Gray Band: Left Tech Image + Right "Send Your Message" Form */}
      <section className="contact-form-band">
        <div className="container">
          <div className="contact-form-grid reveal visible">
            {/* Left Rounded IT Tech Image */}
            <div className="contact-portrait-box">
              <img
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1000&q=85"
                alt="AfricaFuture consulting, IT technology & software solutions workspace"
                className="contact-portrait-img"
              />
            </div>

            {/* Right Form Container */}
            <div className="contact-form-box">
              <div className="ritovex-about-pill" style={{ marginBottom: '12px' }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span>Get in touch</span>
              </div>

              <h2 className="contact-form-heading">Send Your Message</h2>
              <div className="contact-heading-divider" />

              {submitted ? (
                <div className="contact-success-alert">
                  <strong>✓ Thank you for reaching out!</strong>
                  <p>
                    Our team at {COMPANY_INFO.legalName} has received your inquiry
                    and will contact you shortly.
                  </p>
                </div>
              ) : (
                <form className="ritovex-contact-form" onSubmit={handleSubmit}>
                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label htmlFor="name">Name*</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Thomas Alison"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="contact-field">
                      <label htmlFor="email">Email*</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@domain.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label htmlFor="phone">Phone Number*</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+27 79 996 2663"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="contact-field">
                      <label htmlFor="budget">Service / Plan*</label>
                      <input
                        id="budget"
                        name="budget"
                        type="text"
                        placeholder="e.g. Digital Marketing (R350/mo), Website, App"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="message">Inquiry about</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      placeholder="Tell us about your retail store, website, or software requirements"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <button type="submit" className="ritovex-submit-btn">
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom 3 Info Cards: Our Address, Phone, Email / Company Registration */}
      <section className="contact-cards-section">
        <div className="container">
          <div className="contact-cards-grid">
            {/* Card 1: Our Address */}
            <div className="contact-info-card reveal">
              <div className="contact-card-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="contact-card-line" />
              <h3 className="contact-card-title">Our Address</h3>
              <p className="contact-card-text">
                <strong>{COMPANY_INFO.legalName}</strong>
                <br />
                {COMPANY_INFO.address}
              </p>
            </div>

            {/* Card 2: Phone */}
            <div className="contact-info-card reveal delay-1">
              <div className="contact-card-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="contact-card-line" />
              <h3 className="contact-card-title">Phone</h3>
              <p className="contact-card-text">
                <a href={`tel:${COMPANY_INFO.phone}`} className="contact-card-link">
                  {COMPANY_INFO.phone}
                </a>
                <br />
                <span>Mon – Sat • Direct Support & Consultations</span>
              </p>
            </div>

            {/* Card 3: Email & Official Entity */}
            <div className="contact-info-card reveal delay-2">
              <div className="contact-card-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className="contact-card-line" />
              <h3 className="contact-card-title">Email</h3>
              <p className="contact-card-text">
                <a href={`mailto:${COMPANY_INFO.email}`} className="contact-card-link">
                  {COMPANY_INFO.email}
                </a>
                <br />
                <span>24/7 Digital Marketing, Web & App Support</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default ContactPage;
