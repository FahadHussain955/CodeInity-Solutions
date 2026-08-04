import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const RegisterPage = () => (
  <main className="w-full max-w-md relative z-10">
    <div className="glass-panel rounded-xl p-8 sm:p-10 w-full relative overflow-hidden shadow-[0_8px_32px_rgba(70,72,212,0.08)]">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container text-on-primary-container mb-4">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
        </div>
        <h1 className="font-headline-md text-headline-md text-primary mb-2">Create Account</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Join GrowthAI Enterprise Platform</p>
      </div>

      <form className="space-y-4 relative z-10">
        {[
          { id: 'name', label: 'Full Name', icon: 'person', type: 'text', placeholder: 'Your full name' },
          { id: 'email', label: 'Email Address', icon: 'mail', type: 'email', placeholder: 'name@company.com' },
          { id: 'password', label: 'Password', icon: 'lock', type: 'password', placeholder: '••••••••' },
          { id: 'confirm', label: 'Confirm Password', icon: 'lock_reset', type: 'password', placeholder: '••••••••' },
        ].map(({ id, label, icon, type, placeholder }) => (
          <div key={id}>
            <label htmlFor={id} className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">{label}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </span>
              <input id={id} type={type} placeholder={placeholder} className="input-glass w-full rounded-lg py-2.5 pl-10 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant" />
            </div>
          </div>
        ))}

        <button type="submit" className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-caps text-label-caps py-3 rounded-lg transition-all duration-200 shadow-[0_4px_12px_rgba(70,72,212,0.2)] active:scale-[0.98] uppercase mt-2">
          Create Account
        </button>
      </form>

      <div className="mt-6 text-center relative z-10">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary hover:text-primary-fixed-variant font-medium transition-colors">Sign In</Link>
        </p>
      </div>
    </div>
  </main>
);

export default RegisterPage;
