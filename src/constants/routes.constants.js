export const ROUTES = {
  ROOT: "/",

  // Auth — Public
  LOGIN: "/login",
  SIGNUP: "/signup",               // Selection page — User vs Seller
  SIGNUP_USER: "/signup/user",     // User registration (Laraib)
  SIGNUP_SELLER: "/signup/seller", // Seller registration
  SIGNIN: "/signin",
  FORGOT_PASSWORD: "/forgot-password",
  SUPER_ADMIN_LOGIN: "/super-admin/login",

  // User — Protected (role: user)
  USER: "/user",
  USER_DASHBOARD: "/user/dashboard",

  // Admin — Protected (role: admin)
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",

  // Super Admin — Protected (role: super_admin)
  SUPER_ADMIN: "/super-admin",
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",

  // Error Pages
  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "/404",
};

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};
