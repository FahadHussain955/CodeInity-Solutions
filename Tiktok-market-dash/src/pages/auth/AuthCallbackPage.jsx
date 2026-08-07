import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import { storage } from '@/utils/storage';
import { AUTH_STORAGE_KEY } from '@/constants/auth';
import nexoraLogo from '@/assets/nexora-logo.png';


const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCredentials } = useAuth();
  const [message, setMessage] = useState('Completing Google sign-in...');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      if (!token) {
        setMessage('Missing authentication token.');
        navigate(`${ROUTES.LOGIN}?error=google_failed`, { replace: true });
        return;
      }

      try {
        storage.set(AUTH_STORAGE_KEY, { token, refreshToken, user: null });
        const user = await authService.getMe();
        if (cancelled) return;
        setCredentials({ user, token, refreshToken });
        navigate(ROUTES.DASHBOARD, { replace: true });
      } catch {
        storage.remove(AUTH_STORAGE_KEY);
        if (!cancelled) {
          navigate(`${ROUTES.LOGIN}?error=google_failed`, { replace: true });
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate, setCredentials]);

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
