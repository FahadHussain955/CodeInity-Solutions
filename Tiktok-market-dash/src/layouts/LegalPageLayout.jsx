import { Link } from 'react-router-dom';
import nexoraLogo from '@/assets/nexora-logo.png';
import { ROUTES } from '@/constants/routes';

/**
 * Shared shell for temporary public legal documents.
 */
const LegalPageLayout = ({ title, children }) => (
  <div className="animated-bg min-h-screen py-10 px-4">
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link to={ROUTES.LOGIN} className="flex items-center gap-3 min-w-0">
          <img src={nexoraLogo} alt="Nexora" className="w-9 h-9 object-contain shrink-0" />
          <span className="font-headline-md text-headline-md text-primary truncate">Nexora</span>
        </Link>
        <Link
          to={ROUTES.LOGIN}
          className="font-label-caps text-label-caps text-primary hover:text-primary-fixed-variant transition-colors shrink-0"
        >
          Back to Sign In
        </Link>
      </div>

      <article className="glass-panel rounded-xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(70,72,212,0.08)]">
        <p className="font-label-caps text-label-caps text-outline uppercase mb-2">Temporary draft</p>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-2">{title}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-8">
          Last updated: August 7, 2026. This page is a placeholder for Nexora and may change before production launch.
        </p>
        <div className="space-y-6 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          {children}
        </div>
      </article>
    </div>
  </div>
);

export default LegalPageLayout;
