import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import { isAuthenticated } from './services/auth';
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
    const p = window.location.pathname || '/';
    return p.length > 1 ? p.replace(/\/+$/, '') : p;
  });

  useEffect(() => {
    // If initial load is a section route like /client-success, scroll to it cleanly without '#'
    if (ROUTE_TO_SECTION[window.location.pathname]) {
      scrollToRouteSection(window.location.pathname);
    }

    const handlePopState = () => {
      const raw = window.location.pathname || '/';
      const path = raw.length > 1 ? raw.replace(/\/+$/, '') : raw;
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

  // Admin area — only reachable by typing /login or /admin directly
  if (currentPath === '/login') {
    if (isAuthenticated()) {
      window.history.replaceState({}, '', '/admin');
      return <AdminPanel onNavigate={navigate} />;
    }
    return <LoginPage onNavigate={navigate} />;
  }

  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    if (!isAuthenticated()) {
      window.history.replaceState({}, '', '/login');
      return <LoginPage onNavigate={navigate} />;
    }
    return <AdminPanel onNavigate={navigate} />;
  }

  return <LandingPage currentPath={currentPath} onNavigate={navigate} />;
}

export default App;
