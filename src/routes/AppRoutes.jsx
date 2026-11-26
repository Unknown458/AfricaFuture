import { useEffect, useState } from 'react';
import LandingPage from '../pages/LandingPage';
import ContactPage from '../pages/ContactPage';
import Login from '../screens/public/Login/Login';
import AdminPanel from '../pages/AdminPanel';
import Public from '../containers/Public/Public';
import Private from '../containers/Private/Private';
import RouterPath from '../app/routerPath';
import { getSession, isAuthenticated } from '../services/auth';

const ROUTE_TO_SECTION = {
  [RouterPath.DigitalMarketing]: '#digital-marketing',
  [RouterPath.Services]: '#adm',
  [RouterPath.Solutions]: '#solutions',
  [RouterPath.About]: '#about',
  [RouterPath.ClientSuccess]: '#client-success',
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

export function AppRoutes() {
  const [currentPath, setCurrentPath] = useState(() => {
    const p = window.location.pathname || '/';
    return p.length > 1 ? p.replace(/\/+$/, '') : p;
  });

  useEffect(() => {
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

  // 1. Contact Page
  if (currentPath === RouterPath.Contact) {
    return <ContactPage currentPath={currentPath} onNavigate={navigate} />;
  }

  // 2. The 3 Login Routes (Wrapped in CargoJet <Public> container)
  // (a) /meemcurtain/login -> "Meemcurtain Login"
  if (currentPath === RouterPath.MeemcurtainLogin) {
    if (isAuthenticated()) {
      window.history.replaceState({}, '', RouterPath.MeemcurtainAdmin);
      return (
        <Private onNavigate={navigate} redirectPath={RouterPath.MeemcurtainLogin}>
          <AdminPanel
            onNavigate={navigate}
            tenant="Meemcurtain"
            loginPath={RouterPath.MeemcurtainLogin}
          />
        </Private>
      );
    }
    return (
      <Public>
        <Login
          onNavigate={navigate}
          screenTitle="Meemcurtain Login"
          brandName="Meemcurtain"
          logoTag="MC"
          redirectPath={RouterPath.MeemcurtainAdmin}
        />
      </Public>
    );
  }

  // (b) /royalcurtain/login -> "Royalcurtain Login"
  if (currentPath === RouterPath.RoyalcurtainLogin) {
    if (isAuthenticated()) {
      window.history.replaceState({}, '', RouterPath.RoyalcurtainAdmin);
      return (
        <Private onNavigate={navigate} redirectPath={RouterPath.RoyalcurtainLogin}>
          <AdminPanel
            onNavigate={navigate}
            tenant="Royalcurtain"
            loginPath={RouterPath.RoyalcurtainLogin}
          />
        </Private>
      );
    }
    return (
      <Public>
        <Login
          onNavigate={navigate}
          screenTitle="Royalcurtain Login"
          brandName="Royalcurtain"
          logoTag="RC"
          redirectPath={RouterPath.RoyalcurtainAdmin}
        />
      </Public>
    );
  }

  // (c) /login -> "Admin Login"
  if (currentPath === RouterPath.Login) {
    if (isAuthenticated()) {
      window.history.replaceState({}, '', RouterPath.Admin);
      return (
        <Private onNavigate={navigate} redirectPath={RouterPath.Login}>
          <AdminPanel
            onNavigate={navigate}
            tenant="Admin"
            loginPath={RouterPath.Login}
          />
        </Private>
      );
    }
    return (
      <Public>
        <Login
          onNavigate={navigate}
          screenTitle="Admin Login"
          brandName="AfricaFuture"
          logoTag="AF"
          redirectPath={RouterPath.Admin}
        />
      </Public>
    );
  }

  // 3. Admin Panel Routes (Wrapped in CargoJet <Private> container)
  // (a) /meemcurtain/admin
  if (
    currentPath === RouterPath.MeemcurtainAdmin ||
    currentPath.startsWith(`${RouterPath.MeemcurtainAdmin}/`)
  ) {
    return (
      <Private onNavigate={navigate} redirectPath={RouterPath.MeemcurtainLogin}>
        <AdminPanel
          onNavigate={navigate}
          tenant="Meemcurtain"
          loginPath={RouterPath.MeemcurtainLogin}
        />
      </Private>
    );
  }

  // (b) /royalcurtain/admin
  if (
    currentPath === RouterPath.RoyalcurtainAdmin ||
    currentPath.startsWith(`${RouterPath.RoyalcurtainAdmin}/`)
  ) {
    return (
      <Private onNavigate={navigate} redirectPath={RouterPath.RoyalcurtainLogin}>
        <AdminPanel
          onNavigate={navigate}
          tenant="Royalcurtain"
          loginPath={RouterPath.RoyalcurtainLogin}
        />
      </Private>
    );
  }

  // (c) /admin
  if (
    currentPath === RouterPath.Admin ||
    currentPath.startsWith(`${RouterPath.Admin}/`)
  ) {
    const session = getSession();
    const tenant = session?.company || 'Admin';
    return (
      <Private onNavigate={navigate} redirectPath={RouterPath.Login}>
        <AdminPanel
          onNavigate={navigate}
          tenant={tenant}
          loginPath={RouterPath.Login}
        />
      </Private>
    );
  }

  // 4. Main Website (Home & Landing sections)
  return <LandingPage currentPath={currentPath} onNavigate={navigate} />;
}

export default AppRoutes;
