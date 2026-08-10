import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { relativeTime } from '@/utils/dateHelpers';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/notifications/notificationsSlice';
import UserAvatar from '@/components/ui/UserAvatar';
import ShopSwitcher from '@/components/navigation/ShopSwitcher';

const iconBtn =
  'inline-flex items-center justify-center h-8 w-8 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30';

const Navbar = ({ onMenuToggle, onInsightsClick, searchPlaceholder = 'Search products…' }) => {
  const { toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications);

  const handleLogout = () => {
    // Intentional Sign Out — SessionIdleGuard redirects without ?session=expired
    logout();
  };

  useEffect(() => {
    if (!user) return;
    dispatch(fetchUnreadCount());
  }, [dispatch, user]);

  useEffect(() => {
    if (!notifOpen) return;
    dispatch(fetchNotifications());
  }, [dispatch, notifOpen]);

  useEffect(() => {
    if (!profileOpen && !notifOpen) return undefined;

    const onPointerDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileOpen, notifOpen]);

  return (
    <header className="flex items-center gap-3 px-4 md:px-6 h-18 z-40 fixed top-0 right-0 w-full md:w-[calc(100%-260px)] bg-navbar/80 backdrop-blur-xl border-b border-outline-variant/20">
      <button
        type="button"
        onClick={onMenuToggle}
        className={`md:hidden shrink-0 ${iconBtn} -ml-1`}
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined text-[22px]">menu</span>
      </button>

      {/* Balanced search — not full-width */}
      <div className="hidden md:block w-[200px] lg:w-[240px] xl:w-[280px] shrink min-w-0">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            className="w-full h-8 bg-surface border border-outline-variant/40 rounded-lg pl-9 pr-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
            placeholder={searchPlaceholder}
            type="search"
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto min-w-0">
        <ShopSwitcher className="hidden sm:flex shrink-0" />

        <button
          type="button"
          onClick={onInsightsClick}
          className="btn-ai-insights inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-body-sm font-medium shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            auto_awesome
          </span>
          <span className="hidden lg:inline">AI Insights</span>
        </button>

        <div className="h-5 w-px bg-outline-variant/30 mx-0.5 hidden sm:block shrink-0" aria-hidden="true" />

        <div className="relative shrink-0" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            className={`${iconBtn} relative`}
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-9 w-80 max-h-[420px] overflow-hidden rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg z-50 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
                <p className="text-body-sm font-medium text-on-background">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch(markAllNotificationsRead())}
                    className="text-label-caps text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {!notifications.length && (
                  <p className="px-4 py-6 text-body-sm text-on-surface-variant text-center">
                    You&apos;re all caught up.
                  </p>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (!n.isRead) dispatch(markNotificationRead(n.id));
                      setNotifOpen(false);
                      if (n.link) {
                        navigate(n.link);
                      } else if (n.type === 'INVENTORY') {
                        navigate('/dashboard/inventory?status=low_stock');
                      }
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-outline-variant/10 hover:bg-surface-variant/30 transition-colors ${
                      n.isRead ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[18px] text-primary mt-0.5 shrink-0">
                        {n.icon || 'notifications'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm text-on-surface font-medium truncate">
                          {n.title || n.message}
                        </p>
                        {n.title && n.message && (
                          <p className="text-label-caps text-on-surface-variant mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        )}
                        <p className="text-label-caps text-outline mt-1">{relativeTime(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className={`${iconBtn} hidden sm:inline-flex`}
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-[20px]">contrast</span>
        </button>

        <div className="relative shrink-0" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30 p-0"
          >
            <UserAvatar user={user} alt="User profile" className="w-full h-full rounded-full" />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-9 w-52 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg p-1.5 z-50"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  navigate(ROUTES.PROFILE);
                  setProfileOpen(false);
                }}
                className="w-full h-10 flex items-center gap-3 px-3 rounded-lg text-on-surface bg-transparent hover:bg-surface-variant/50 transition-colors duration-150 font-body-sm text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">person</span>
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  navigate(ROUTES.SETTINGS);
                  setProfileOpen(false);
                }}
                className="w-full h-10 flex items-center gap-3 px-3 rounded-lg text-on-surface bg-transparent hover:bg-surface-variant/50 transition-colors duration-150 font-body-sm text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">settings</span>
                Settings
              </button>
              <div className="h-px bg-outline-variant/30 my-1.5 mx-2" role="separator" />
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full h-10 flex items-center gap-3 px-3 rounded-lg text-error bg-transparent hover:bg-error-container transition-colors duration-150 font-body-sm text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-error shrink-0">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
