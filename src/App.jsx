import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import ContactPage from './pages/ContactPage';
import { useTheme } from './hooks/useTheme';

const ROUTE_TO_SECTION = {
  '/digital-marketing': '#digital-marketing',
  '/services': '#adm',
  '/solutions': '#solutions',
  '/about': '#about',
  '/client-success': '#client-success',
};

function scrollToRouteSection(pathname) {
  const selector = ROUTE_TO_SECTION[pathname];
  if (selector) {
    setTimeout(() => {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function App() {
  useTheme();

  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    // If initial load is a section route like /client-success, scroll to it cleanly without '#'
    if (ROUTE_TO_SECTION[window.location.pathname]) {
      scrollToRouteSection(window.location.pathname);
    }

    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);
      scrollToRouteSection(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    scrollToRouteSection(path);
  };

  if (currentPath === '/contact') {
    return <ContactPage currentPath={currentPath} onNavigate={navigate} />;
  }

  return <LandingPage currentPath={currentPath} onNavigate={navigate} />;
}

export default App;
