import { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import MarqueeTicker from '../components/MarqueeTicker';
import AboutUsSection from '../components/AboutUsSection';
import AdmTabsSection from '../components/AdmTabsSection';
import ServicesSection from '../components/ServicesSection';
import ClientSuccessSection from '../components/ClientSuccessSection';
import CtaSection from '../components/CtaSection';
import Footer from '../components/Footer';
import DetailModal from '../components/DetailModal';
import { useScrollReveal } from '../hooks/useScrollReveal';

function LandingPage({ currentPath, onNavigate }) {
  const [selectedModal, setSelectedModal] = useState(null);

  useScrollReveal();

  return (
    <div className="app-wrapper">
      {/* Ambient Animated Glow Orbs */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      {/* Top Sticky Navbar */}
      <Navbar currentPath={currentPath} onNavigate={onNavigate} />

      {/* Clean Hero Banner */}
      <HeroBanner onNavigate={onNavigate} />

      {/* Scrolling Marquee Ticker */}
      <MarqueeTicker />

      {/* Ritovex "Who We Are. Learn About us" Section with Scroll Animation */}
      <AboutUsSection />

      {/* Persistent 4-Tab ADM Section */}
      <AdmTabsSection />

      {/* Website, Mobile App, WhatsApp API & Gmail API Services */}
      <ServicesSection onSelectService={setSelectedModal} />

      {/* Client Success Stories */}
      <ClientSuccessSection onSelectStory={setSelectedModal} />

      {/* Call to Action Banner */}
      <CtaSection onNavigate={onNavigate} />

      {/* Footer */}
      <Footer onNavigate={onNavigate} />

      {/* Service / Case Study Modal */}
      <DetailModal
        item={selectedModal}
        onClose={() => setSelectedModal(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
}

export default LandingPage;
