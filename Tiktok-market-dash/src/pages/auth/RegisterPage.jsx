import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { registerSchema } from '@/features/auth/authSchemas';
import AuthErrorAlert from '@/components/auth/AuthErrorAlert';
import FieldError from '@/components/auth/FieldError';
import PasswordStrength from '@/components/auth/PasswordStrength';
import nexoraLogo from '@/assets/nexora-logo.png';

const RegisterPage = () => {
  const { register: registerAccount, isSubmitting, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    mode: 'onSubmit',
  });

  const passwordValue = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => () => clearError(), [clearError]);

  const onSubmit = async (values) => {
    clearError();
    const result = await registerAccount({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    if (result.ok) {
      navigate(ROUTES.DASHBOARD, { replace: true });
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
            className="inline-block w-14 h-14 rounded-2xl object-contain mb-4 bg-[#090d2a]"
          />
          <h1 className="font-headline-md text-headline-md text-primary mb-1">Create Account</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Join Nexora — AI powered commerce growth</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10" noValidate>
          <AuthErrorAlert message={error} onDismiss={clearError} />

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
                <a href="#" className="text-primary hover:text-primary-fixed-variant font-medium transition-colors">
                  Terms &amp; Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:text-primary-fixed-variant font-medium transition-colors">
                  Privacy Policy
                </a>
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
    </main>
  );
};

export default RegisterPage;
