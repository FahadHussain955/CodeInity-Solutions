import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
export const rootReducer = combineReducers({
  auth: authReducer
  // TODO: Add other feature reducers here (products, orders, customers, etc)
});
