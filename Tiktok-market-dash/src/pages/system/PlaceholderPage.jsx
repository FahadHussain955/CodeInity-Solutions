import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const PlaceholderPage = ({ title, icon, description }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center">
        <span className="material-symbols-outlined text-[32px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <h2 className="font-headline-md text-headline-md text-on-background">{title}</h2>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">{description || 'This page is under construction. Check back soon!'}</p>
      <button
        onClick={() => navigate(ROUTES.DASHBOARD)}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm mt-2"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Dashboard
      </button>
    </div>
  );
};

export default PlaceholderPage;
