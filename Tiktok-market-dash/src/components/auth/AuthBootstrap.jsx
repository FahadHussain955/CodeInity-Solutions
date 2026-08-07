import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

/** Restores JWT session from localStorage via GET /auth/me on app boot. */
const AuthBootstrap = ({ children }) => {
  const { token, restoreSession, initializing } = useAuth();

  useEffect(() => {
    if (token) {
      restoreSession();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (token && initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-body-sm text-on-surface-variant">Restoring session...</p>
      </div>
    );
  }

  return children;
};

export default AuthBootstrap;
