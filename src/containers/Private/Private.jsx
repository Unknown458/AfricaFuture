// -------------------------------------------------------------------------------------------
// Private Container (CargoJet pattern)
// -------------------------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import AuthMiddleware from '../../middlewares/auth/auth';
import { isAuthenticated } from '../../services/auth';

export function Private({ children, onNavigate, redirectPath = '/login' }) {
  const [authorized, setAuthorized] = useState(() => isAuthenticated());

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      const isValid = await AuthMiddleware();
      if (!isMounted) return;
      if (!isValid) {
        setAuthorized(false);
        if (onNavigate) {
          onNavigate(redirectPath);
        }
      } else {
        setAuthorized(true);
      }
    };
    checkAuth();
    const timer = setInterval(checkAuth, 5000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [onNavigate, redirectPath]);

  if (!authorized) {
    return null;
  }

  return (
    <div className="app-private-container">
      {children}
    </div>
  );
}

export default Private;
