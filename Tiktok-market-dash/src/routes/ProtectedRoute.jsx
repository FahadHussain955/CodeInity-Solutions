import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '@/constants/routes';

const ProtectedRoute = () => {
  const { isAuthenticated, initializing } = useSelector((state) => state.auth);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-body-sm text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
};

export default ProtectedRoute;
