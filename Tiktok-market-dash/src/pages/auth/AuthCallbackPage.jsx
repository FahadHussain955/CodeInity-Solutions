import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import { storage } from '@/utils/storage';
import { AUTH_STORAGE_KEY } from '@/constants/auth';
import nexoraLogo from '@/assets/nexora-logo.png';

/**
 * Module-scoped completion promise.
 * React Strict Mode (dev) mounts → unmounts → remounts effects. The first mount
 * clears the URL hash after capturing tokens; without recovery + dedupe the
 * remount sees an empty hash and falsely redirects to ?error=google_failed.
 */
let oauthCallbackPromise = null;

const readOAuthTokens = () => {
  const hash = window.location.hash?.replace(/^#/, '') || '';
  const fromHash = new URLSearchParams(hash);
  const fromQuery = new URLSearchParams(window.location.search);
  return {
    token: fromHash.get('token') || fromQuery.get('token'),
    refreshToken: fromHash.get('refreshToken') || fromQuery.get('refreshToken'),
  };
};

const resolveOAuthTokens = () => {
  const fromUrl = readOAuthTokens();
  if (fromUrl.token) return fromUrl;

  // Recover after Strict Mode remount (hash already cleared, tokens in storage).
  const stored = storage.get(AUTH_STORAGE_KEY);
  if (stored?.token) {
    return {
      token: stored.token,
      refreshToken: stored.refreshToken || null,
    };
  }
  return { token: null, refreshToken: null };
};

const completeOAuthSession = async (token, refreshToken) => {
  storage.set(AUTH_STORAGE_KEY, { token, refreshToken, user: null });
  // Clear tokens from the address bar only after they are persisted.
  if (window.location.hash || window.location.search.includes('token=')) {
    window.history.replaceState({}, document.title, '/auth/callback');
  }
  const user = await authService.getMe();
  storage.set(AUTH_STORAGE_KEY, { token, refreshToken, user });
  return { user, token, refreshToken };
};

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { setCredentials } = useAuth();
  const [message, setMessage] = useState('Completing Google sign-in...');

  useEffect(() => {
    let active = true;

    const finish = async (session) => {
      if (!active) return;
      setCredentials(session);
      navigate(ROUTES.DASHBOARD, { replace: true });
    };

    const fail = () => {
      storage.remove(AUTH_STORAGE_KEY);
      if (active) {
        navigate(`${ROUTES.LOGIN}?error=google_failed`, { replace: true });
      }
    };

    const run = async () => {
      const { token, refreshToken } = resolveOAuthTokens();

      // Remount while an earlier attempt is still completing.
      if (!token && oauthCallbackPromise) {
        try {
          const session = await oauthCallbackPromise;
          await finish(session);
        } catch {
          fail();
        }
        return;
      }

      if (!token) {
        setMessage('Missing authentication token.');
        if (active) {
          navigate(`${ROUTES.LOGIN}?error=google_failed`, { replace: true });
        }
        return;
      }

      try {
        if (!oauthCallbackPromise) {
          oauthCallbackPromise = completeOAuthSession(token, refreshToken).finally(() => {
            oauthCallbackPromise = null;
          });
        }
        const session = await oauthCallbackPromise;
        await finish(session);
      } catch {
        fail();
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [navigate, setCredentials]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <img
          src={nexoraLogo}
          alt="Nexora"
          className="w-12 h-12 object-contain animate-pulse"
        />
        <p className="text-body-sm text-on-surface-variant">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
