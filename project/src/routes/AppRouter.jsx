import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES, ROLES } from "../constants/routes.constants";
import ProtectedRoute from "./ProtectedRoute";

import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import UserLayout from "../layouts/UserLayout";

import Login from "../pages/auth/Login";
import SignUpSelect from "../pages/auth/SignUpSelect";
import SignUp from "../pages/auth/SignUp";
import SignUpSeller from "../pages/auth/SignUpSeller";
import SignIn from "../pages/auth/SignIn";
import ForgotPassword from "../pages/auth/ForgotPassword";
import SuperAdminLogin from "../pages/auth/SuperAdminLogin";

import AdminDashboard from "../pages/admin/AdminDashboard";
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import UserDashboard from "../pages/user/UserDashboard";

import NotFound from "../pages/NotFound";
import UnauthorizedPage from "../components/common/UnauthorizedPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.LOGIN} replace />} />

        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN}             element={<Login />} />
          <Route path={ROUTES.SIGNUP}            element={<SignUpSelect />} />
          <Route path={ROUTES.SIGNUP_USER}       element={<SignUp />} />
          <Route path={ROUTES.SIGNUP_SELLER}     element={<SignUpSeller />} />
          <Route path={ROUTES.SIGNIN}            element={<SignIn />} />
          <Route path={ROUTES.FORGOT_PASSWORD}   element={<ForgotPassword />} />
          <Route path={ROUTES.SUPER_ADMIN_LOGIN} element={<SuperAdminLogin />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.USER]} />}>
          <Route element={<UserLayout />}>
            <Route path={ROUTES.USER}           element={<Navigate to={ROUTES.USER_DASHBOARD} replace />} />
            <Route path={ROUTES.USER_DASHBOARD} element={<UserDashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN}           element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]} />}>
          <Route element={<SuperAdminLayout />}>
            <Route path={ROUTES.SUPER_ADMIN}           element={<Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />} />
            <Route path={ROUTES.SUPER_ADMIN_DASHBOARD} element={<SuperAdminDashboard />} />
          </Route>
        </Route>

        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={ROUTES.NOT_FOUND}    element={<NotFound />} />
        <Route path="*"                   element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
