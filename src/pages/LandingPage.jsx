import { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import MarqueeTicker from '../components/MarqueeTicker';
import RetailPromoSection from '../components/RetailPromoSection';
import AdmTabsSection from '../components/AdmTabsSection';
import ServicesSection from '../components/ServicesSection';
import AboutUsSection from '../components/AboutUsSection';
import ClientSuccessSection from '../components/ClientSuccessSection';
import CtaSection from '../components/CtaSection';
import Footer from '../components/Footer';
import DetailModal from '../components/DetailModal';
import GetStartedModal from '../components/GetStartedModal';
import { useScrollReveal } from '../hooks/useScrollReveal';

function LandingPage({ currentPath, onNavigate }) {
  const [selectedModal, setSelectedModal] = useState(null);
  const [getStartedOpen, setGetStartedOpen] = useState(false);

  useScrollReveal();

  return (
    <div className="app-wrapper">
      {/* Ambient Animated Glow Orbs */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      {/* Top Sticky Navbar */}
      <Navbar currentPath={currentPath} onNavigate={onNavigate} />

      {/* Hero Banner with Main Retail Digital Marketing, Website & Software Message */}
      <HeroBanner
        onNavigate={onNavigate}
        onOpenGetStarted={() => setGetStartedOpen(true)}
      />

      {/* Scrolling Marquee Ticker */}
      <MarqueeTicker />

      {/* Suggested Homepage Promotional Section: Grow Your Business Online (R350/mo) */}
      <RetailPromoSection onOpenGetStarted={() => setGetStartedOpen(true)} />

      {/* Highlight Main 3 Sections: 1. Digital Marketing, 2. Website Development, 3. Software Application */}
      <AdmTabsSection onOpenGetStarted={() => setGetStartedOpen(true)} />

      {/* Complete 6-Card Services Suite */}
      <ServicesSection onSelectService={setSelectedModal} />

      {/* About AfricaFuture Section with IT Tech Image & Animated Stats */}
      <AboutUsSection onOpenGetStarted={() => setGetStartedOpen(true)} />

      {/* Client Success Stories */}
      <ClientSuccessSection onSelectStory={setSelectedModal} />

      {/* Call to Action Banner */}
      <CtaSection
        onNavigate={onNavigate}
        onOpenGetStarted={() => setGetStartedOpen(true)}
      />

      {/* Footer */}
      <Footer onNavigate={onNavigate} />

      {/* Service / Case Study Modal */}
      <DetailModal
        item={selectedModal}
        onClose={() => setSelectedModal(null)}
        onNavigate={onNavigate}
      />

      {/* GET STARTED TODAY Dialog Box with Highlighted Phone Number & Address */}
      <GetStartedModal
        isOpen={getStartedOpen}
        onClose={() => setGetStartedOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
}

export default LandingPage;
