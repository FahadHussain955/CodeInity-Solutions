import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import globalReducer from "./globalSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    global: globalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
