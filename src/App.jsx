import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import ContactPage from './pages/ContactPage';
import { useTheme } from './hooks/useTheme';

function App() {
  useTheme();

  const [currentPath, setCurrentPath] = useState(() => {
    const path = window.location.pathname;
    return path === '/contact' ? '/contact' : '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path === '/contact' ? '/contact' : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path, hash = '') => {
    const targetUrl = hash ? `${path}${hash}` : path;
    window.history.pushState({}, '', targetUrl);
    setCurrentPath(path === '/contact' ? '/contact' : '/');

    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (currentPath === '/contact') {
    return <ContactPage currentPath={currentPath} onNavigate={navigate} />;
  }

  return <LandingPage currentPath={currentPath} onNavigate={navigate} />;
}

export default App;
