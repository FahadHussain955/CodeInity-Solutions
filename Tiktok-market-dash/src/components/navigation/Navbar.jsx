import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

const Navbar = ({ onMenuToggle, searchPlaceholder = 'Search products, SKUs, or categories...' }) => {
  const { toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="flex justify-between items-center px-container-margin h-18 z-40 fixed top-0 right-0 w-full md:w-[calc(100%-260px)] bg-surface/60 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm transition-all duration-300">
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 h-5 text-[10px] font-medium text-outline bg-surface-container rounded border border-outline-variant/30">⌘</kbd>
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 h-5 text-[10px] font-medium text-outline bg-surface-container rounded border border-outline-variant/30">K</kbd>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-auto">
        {/* AI Insights */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-body-sm text-body-sm font-medium">
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          <span className="hidden sm:inline">AI Insights</span>
        </button>

        <div className="h-6 w-px bg-outline-variant/30 mx-2 hidden sm:block" />

        {/* Notifications */}
        <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant/50 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant/50 hidden sm:block"
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined">contrast</span>
        </button>

        {/* Profile */}
        <div className="relative ml-2">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnhN05FsJh-nDINzsl2GGTLcyXvFG0tdleQ5KhqGvzLyRN2xMQaGYVd3L8Y3qIix0tKLZ7zgsx00wk5c6ZQqr4gRkxV9ZXRBC9dT17jRz8rYYZdyYP8fLU7Wd-UFzqjsYEDw46P1nmmfdlfVflqo2pTpWJ7NJQkHV4cxiQB5TAHMfkHKuGwpIM9feFMjdthg3dApbL4XCZ9uj4ZT9jsMLpSZBi3WgESlorq-N-S6dIT0ErpBO-rkfl"
              alt="User profile"
              className="w-full h-full object-cover"
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-10 w-48 glass-panel rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-50">
              <button
                onClick={() => { navigate(ROUTES.PROFILE); setProfileOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-on-surface hover:bg-surface-variant/40 transition-colors font-body-sm text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Profile
              </button>
              <button
                onClick={() => { navigate(ROUTES.SETTINGS); setProfileOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-on-surface hover:bg-surface-variant/40 transition-colors font-body-sm text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                Settings
              </button>
              <div className="h-px bg-outline-variant/20 mx-4" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-error hover:bg-error-container/40 transition-colors font-body-sm text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
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
