import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
const ProtectedRoute = () => {
  const isAuthenticated = false;
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
};
export default ProtectedRoute;
