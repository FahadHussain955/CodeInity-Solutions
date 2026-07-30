import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./AuthLayout.module.css";

/**
 * AuthLayout
 * Wrapper for all public auth pages:
 * Login, SignUp, SignIn, ForgotPassword, SuperAdminLogin
 *
 * Provides a centered card layout with the cream/sage branding.
 */
const AuthLayout = () => {
  return (
    <div className={styles.authRoot}>
      {/* Background decorative blobs */}
      <div className={styles.blobTopRight} />
      <div className={styles.blobBottomLeft} />

      {/* Auth Card */}
      <div className={styles.authCard}>
        {/* Logo / Brand */}
        <div className={styles.brand}>
          <div className={styles.logoMark}>
            <span>M</span>
          </div>
          <span className={styles.brandName}>MultiTenant</span>
        </div>

        {/* Page Content (injected by child routes) */}
        <Outlet />
      </div>

      {/* Footer */}
      <p className={styles.footer}>
        © {new Date().getFullYear()} MultiTenant Inc. All rights reserved.
      </p>
    </div>
  );
};

export default AuthLayout;
