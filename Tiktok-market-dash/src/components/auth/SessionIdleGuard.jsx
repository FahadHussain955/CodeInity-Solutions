import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, refreshSession } from '@/features/auth/authSlice';
import {
  AUTH_ACTIVITY_KEY,
  IDLE_TIMEOUT_MS,
  REFRESH_INTERVAL_MS,
} from '@/constants/auth';
import {
  endIntentionalLogout,
  isIntentionalLogout,
  setSessionInvalidHandler,
} from '@/lib/sessionBridge';
import { ROUTES } from '@/constants/routes';

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

const isAuthRoute = (pathname) =>
  pathname === ROUTES.LOGIN ||
  pathname === ROUTES.REGISTER ||
  pathname === ROUTES.AUTH_CALLBACK ||
  pathname === ROUTES.TERMS ||
  pathname === ROUTES.PRIVACY;

/**
 * Idle timeout + session expiry redirect (must live inside BrowserRouter).
 * - Refreshes access token while the user is active
 * - Signs out after 15 minutes idle
 * - On token/session invalidation, clears auth and sends user to login
 * - Intentional Sign Out redirects to Login without "Session expired"
 */
const SessionIdleGuard = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const refreshToken = useSelector((state) => state.auth.refreshToken);
  const lastRefreshAt = useRef(0);
  const wasAuthenticated = useRef(isAuthenticated);

  const goToLogin = useCallback(
    (reason = 'expired') => {
      dispatch(logout());
      if (!isAuthRoute(location.pathname)) {
        navigate(`${ROUTES.LOGIN}?session=${reason}`, { replace: true });
      }
    },
    [dispatch, navigate, location.pathname]
  );

  const markActivity = useCallback(() => {
    try {
      sessionStorage.setItem(AUTH_ACTIVITY_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }, []);

  const getLastActivity = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(AUTH_ACTIVITY_KEY);
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : Date.now();
    } catch {
      return Date.now();
    }
  }, []);

  // Axios refresh failures → Redux logout + login redirect
  useEffect(() => {
    setSessionInvalidHandler((reason) => {
      goToLogin(reason || 'expired');
    });
    return () => setSessionInvalidHandler(null);
  }, [goToLogin]);

  // Auth flipped true → false: intentional Sign Out vs real expiry
  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      if (isIntentionalLogout()) {
        if (!isAuthRoute(location.pathname)) {
          navigate(ROUTES.LOGIN, { replace: true });
        }
        endIntentionalLogout();
      } else if (!isAuthRoute(location.pathname)) {
        navigate(`${ROUTES.LOGIN}?session=expired`, { replace: true });
      }
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    markActivity();

    const onActivity = () => {
      markActivity();
      const now = Date.now();
      if (refreshToken && now - lastRefreshAt.current >= REFRESH_INTERVAL_MS) {
        lastRefreshAt.current = now;
        dispatch(refreshSession());
      }
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, onActivity, { passive: true });
    });

    const tick = window.setInterval(() => {
      const idleFor = Date.now() - getLastActivity();
      if (idleFor >= IDLE_TIMEOUT_MS) {
        goToLogin('idle');
        return;
      }
      if (refreshToken && idleFor < IDLE_TIMEOUT_MS) {
        const now = Date.now();
        if (now - lastRefreshAt.current >= REFRESH_INTERVAL_MS) {
          lastRefreshAt.current = now;
          dispatch(refreshSession());
        }
      }
    }, 15_000);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, onActivity);
      });
      window.clearInterval(tick);
    };
  }, [isAuthenticated, refreshToken, dispatch, markActivity, getLastActivity, goToLogin]);

  return children;
};

export default SessionIdleGuard;
