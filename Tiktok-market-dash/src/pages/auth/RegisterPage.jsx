import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { registerSchema } from '@/features/auth/authSchemas';
import AuthErrorAlert from '@/components/auth/AuthErrorAlert';
import FieldError from '@/components/auth/FieldError';
import PasswordStrength from '@/components/auth/PasswordStrength';
import nexoraLogo from '@/assets/nexora-logo.png';
import { oauthErrorMessage } from '@/utils/oauthErrors';
import LegalModal from '@/components/legal/LegalModal';

const RegisterPage = () => {
  const {
    register: registerAccount,
    isSubmitting,
    error,
    clearError,
    isAuthenticated,
    registerWithGoogle,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const oauthError = searchParams.get('error');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [legalDoc, setLegalDoc] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const passwordValue = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => () => clearError(), [clearError]);

  const dismissAlert = () => {
    clearError();
    if (searchParams.has('error')) {
      const next = new URLSearchParams(searchParams);
      next.delete('error');
      setSearchParams(next, { replace: true });
    }
  };

  const onSubmit = async (values) => {
    dismissAlert();
    const result = await registerAccount({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    if (result.ok) {
      navigate(`${ROUTES.LOGIN}?registered=1`, { replace: true });
    }
  };

  return (
    <main className="w-full max-w-md relative z-10">
      <div className="glass-panel rounded-xl p-8 sm:p-10 w-full relative overflow-hidden shadow-[0_8px_32px_rgba(70,72,212,0.08)]">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <img
            src={nexoraLogo}
            alt="Nexora"
            className="inline-block w-16 h-16 object-contain mb-4"
          />
          <h1 className="font-headline-md text-headline-md text-primary mb-1">Create Account</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Join Nexora — AI powered commerce growth</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10" noValidate>
          <AuthErrorAlert
            message={error || oauthErrorMessage(oauthError, { page: 'register' })}
            onDismiss={dismissAlert}
          />

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </span>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                aria-invalid={Boolean(errors.name)}
                className={`input-glass w-full rounded-lg py-2.5 pl-10 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant ${
                  errors.name ? 'border-error' : ''
                }`}
                {...register('name')}
              />
            </div>
            <FieldError message={errors.name?.message} />
          </div>

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
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                aria-invalid={Boolean(errors.email)}
                className={`input-glass w-full rounded-lg py-2.5 pl-10 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant ${
                  errors.email ? 'border-error' : ''
                }`}
                {...register('email')}
              />
            </div>
            <FieldError message={errors.email?.message} />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.password)}
                className={`input-glass w-full rounded-lg py-2.5 pl-10 pr-10 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant ${
                  errors.password ? 'border-error' : ''
                }`}
                {...register('password')}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            <PasswordStrength password={passwordValue} />
            <FieldError message={errors.password?.message} />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <span className="material-symbols-outlined text-[20px]">lock_reset</span>
              </span>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.confirmPassword)}
                className={`input-glass w-full rounded-lg py-2.5 pl-10 pr-10 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant ${
                  errors.confirmPassword ? 'border-error' : ''
                }`}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          {/* Terms */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20 accent-[var(--color-primary)]"
                {...register('acceptTerms')}
              />
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLegalDoc('terms');
                  }}
                  className="text-primary hover:text-primary-fixed-variant font-medium transition-colors"
                >
                  Terms &amp; Conditions
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLegalDoc('privacy');
                  }}
                  className="text-primary hover:text-primary-fixed-variant font-medium transition-colors"
                >
                  Privacy Policy
                </button>
              </span>
            </label>
            <FieldError message={errors.acceptTerms?.message} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-caps text-label-caps py-3 rounded-lg transition-all duration-200 shadow-[0_4px_12px_rgba(70,72,212,0.2)] active:scale-[0.98] uppercase mt-2 disabled:opacity-60 disabled:pointer-events-none disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            )}
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant/30" />
            <span className="flex-shrink-0 mx-4 text-outline font-body-sm text-body-sm">or sign up with</span>
            <div className="flex-grow border-t border-outline-variant/30" />
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={registerWithGoogle}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-outline-variant/50 bg-surface-container-lowest/50 hover:bg-surface-variant/50 transition-colors font-label-caps text-label-caps text-on-surface disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary hover:text-primary-fixed-variant font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <LegalModal
        doc={legalDoc}
        onClose={() => setLegalDoc(null)}
        onSwitch={setLegalDoc}
      />
    </main>
  );
};

export default RegisterPage;
