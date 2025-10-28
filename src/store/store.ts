import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../api/baseApi';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    // Add the RTK Query API reducer
    [baseApi.reducerPath]: baseApi.reducer,

    // Add other reducers
    auth: authReducer,
    cart: cartReducer,
  },

  // Adding the api middleware enables caching, invalidation, polling, and other features of RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
