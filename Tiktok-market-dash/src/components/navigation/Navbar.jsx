import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

const Navbar = ({ onMenuToggle, onInsightsClick, searchPlaceholder = 'Search products, SKUs, or categories...' }) => {
  const { toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  useEffect(() => {
    if (!profileOpen) return undefined;

    const onPointerDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileOpen]);

  return (
    <header className="flex justify-between items-center px-container-margin h-18 z-40 fixed top-0 right-0 w-full md:w-[calc(100%-260px)] bg-navbar/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm transition-all duration-300">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMenuToggle}
        className="md:hidden text-on-surface-variant p-2 -ml-2 rounded-lg hover:bg-surface-variant/50"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden md:flex items-center">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            className="w-full bg-transparent border border-outline-variant/50 rounded-full py-2 pl-10 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            placeholder={searchPlaceholder}
            type="text"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-auto">
        <button
          onClick={onInsightsClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-body-sm text-body-sm font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          <span className="hidden sm:inline">AI Insights</span>
        </button>

        <div className="h-6 w-px bg-outline-variant/30 mx-2 hidden sm:block" />

        <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant/50 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface" />
        </button>

        <button
          onClick={toggleTheme}
          className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant/50 hidden sm:block"
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined">contrast</span>
        </button>

        <div className="relative ml-2" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnhN05FsJh-nDINzsl2GGTLcyXvFG0tdleQ5KhqGvzLyRN2xMQaGYVd3L8Y3qIix0tKLZ7zgsx00wk5c6ZQqr4gRkxV9ZXRBC9dT17jRz8rYYZdyYP8fLU7Wd-UFzqjsYEDw46P1nmmfdlfVflqo2pTpWJ7NJQkHV4cxiQB5TAHMfkHKuGwpIM9feFMjdthg3dApbL4XCZ9uj4ZT9jsMLpSZBi3WgESlorq-N-S6dIT0ErpBO-rkfl"
              alt="User profile"
              className="w-full h-full object-cover"
            />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-10 w-52 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg p-1.5 z-50"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => { navigate(ROUTES.PROFILE); setProfileOpen(false); }}
                className="w-full h-11 flex items-center gap-3 px-4 rounded-lg text-on-surface bg-transparent hover:bg-surface-variant/50 transition-colors duration-150 font-body-sm text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">person</span>
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => { navigate(ROUTES.SETTINGS); setProfileOpen(false); }}
                className="w-full h-11 flex items-center gap-3 px-4 rounded-lg text-on-surface bg-transparent hover:bg-surface-variant/50 transition-colors duration-150 font-body-sm text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">settings</span>
                Settings
              </button>
              <div className="h-px bg-outline-variant/30 my-1.5 mx-2" role="separator" />
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full h-11 flex items-center gap-3 px-4 rounded-lg text-error bg-transparent hover:bg-error-container transition-colors duration-150 font-body-sm text-body-sm"
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
