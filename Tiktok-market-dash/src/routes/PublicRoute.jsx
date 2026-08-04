import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
const PublicRoute = () => {
  const isAuthenticated = false;
  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />;
};
export default PublicRoute;
