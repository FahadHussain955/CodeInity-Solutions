// =============================================================================
// 404 NOT FOUND PAGE
// Displayed for any unmatched route.
// =============================================================================

import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../constants/appConstants';
import Button from '../../components/common/Button';

/**
 * NotFound — full-page 404 displayed outside the MainLayout shell.
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page" data-testid="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-code" aria-hidden="true">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-description">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="not-found-actions">
          <Button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            leftIcon={<Home size={16} />}
            data-testid="not-found-home-btn"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft size={16} />}
            data-testid="not-found-back-btn"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
