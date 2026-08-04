import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login — wire to backend later
    login({ user: { name: 'Enterprise User', email }, token: 'mock-token' });
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <main className="w-full max-w-md relative z-10">
      {/* Login Card */}
      <div className="glass-panel rounded-xl p-8 sm:p-10 w-full relative overflow-hidden shadow-[0_8px_32px_rgba(70,72,212,0.08)]">
        {/* Decorative Glows */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container text-on-primary-container mb-4">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              monitoring
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary mb-2">GrowthAI</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Sign in to your enterprise workspace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="input-glass w-full rounded-lg py-2.5 pl-10 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block font-label-caps text-label-caps text-on-surface-variant uppercase">
                  Password
                </label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="font-label-caps text-label-caps text-primary hover:text-primary-fixed-variant transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-glass w-full rounded-lg py-2.5 pl-10 pr-10 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-caps text-label-caps py-3 rounded-lg transition-all duration-200 shadow-[0_4px_12px_rgba(70,72,212,0.2)] hover:shadow-[0_6px_16px_rgba(70,72,212,0.3)] active:scale-[0.98] uppercase"
          >
            Sign In
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant/30" />
            <span className="flex-shrink-0 mx-4 text-outline font-body-sm text-body-sm">or continue with</span>
            <div className="flex-grow border-t border-outline-variant/30" />
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-outline-variant/50 bg-surface-container-lowest/50 hover:bg-surface-variant/50 transition-colors font-label-caps text-label-caps text-on-surface"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-outline-variant/50 bg-surface-container-lowest/50 hover:bg-surface-variant/50 transition-colors font-label-caps text-label-caps text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px] text-[#95BF47]">shopping_bag</span>
              Shopify
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center relative z-10">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary hover:text-primary-fixed-variant font-medium transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Legal Links */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-4 font-body-sm text-body-sm text-outline">
          <a href="#" className="hover:text-on-surface transition-colors">Privacy Policy</a>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <a href="#" className="hover:text-on-surface transition-colors">Terms of Service</a>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
