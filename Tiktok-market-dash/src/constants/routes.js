export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth/callback',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  TERMS: '/terms',
  PRIVACY: '/privacy',

  // Dashboard
  DASHBOARD: '/dashboard',

  // TikTok Ads
  CAMPAIGNS: '/dashboard/campaigns',
  CAMPAIGN_DETAIL: '/dashboard/campaigns/:id',
  ADS: '/dashboard/ads',
  AD_DETAIL: '/dashboard/ads/:id',
  AUDIENCE: '/dashboard/audience',

  // Store
  PRODUCTS: '/dashboard/products',
  PRODUCT_NEW: '/dashboard/products/new',
  PRODUCT_DETAIL: '/dashboard/products/:id',
  PRODUCT_EDIT: '/dashboard/products/:id/edit',
  ORDERS: '/dashboard/orders',
  ORDER_DETAIL: '/dashboard/orders/:id',
  INVENTORY: '/dashboard/inventory',
  CUSTOMERS: '/dashboard/customers',
  CUSTOMER_DETAIL: '/dashboard/customers/:id',

  // Account
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',

  NOT_FOUND: '*',
};
