import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import inventoryReducer from "../features/inventory/inventorySlice";
import customersReducer from "../features/customers/customersSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import integrationsReducer from "../features/integrations/integrationsSlice";
import campaignsReducer from "../features/campaigns/campaignsSlice";
import adsReducer from "../features/ads/adsSlice";
import audiencesReducer from "../features/audiences/audiencesSlice";
import aiReducer from "../features/ai/aiSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import productsReducer from "../features/products/productsSlice";
import ordersReducer from "../features/orders/ordersSlice";

const appReducer = combineReducers({
  auth: authReducer,
  inventory: inventoryReducer,
  customers: customersReducer,
  dashboard: dashboardReducer,
  integrations: integrationsReducer,
  campaigns: campaignsReducer,
  ads: adsReducer,
  audiences: audiencesReducer,
  ai: aiReducer,
  notifications: notificationsReducer,
  products: productsReducer,
  orders: ordersReducer,
});

export const rootReducer = (state, action) => {
  if (action.type === "auth/logout" || action.type === "auth/logout/pending") {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};
