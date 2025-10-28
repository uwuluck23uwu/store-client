import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/api.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Save to AsyncStorage
      AsyncStorage.setItem('token', action.payload.token);
      AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Clear AsyncStorage
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      // Update AsyncStorage
      AsyncStorage.setItem('user', JSON.stringify(action.payload));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
