import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center animated-bg p-4">
    <div className="text-center space-y-6">
      <div className="relative inline-block">
        <span className="font-display-lg text-[120px] font-bold text-primary/10 select-none leading-none">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[40px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              search_off
            </span>
          </div>
        </div>
      </div>
      <div>
        <h1 className="font-headline-md text-headline-md text-on-background mb-2">Page Not Found</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link
        to={ROUTES.DASHBOARD}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px]">home</span>
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
