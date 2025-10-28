import { baseApi } from './baseApi';
import { LoginRequest, RegisterRequest, TokenResponse, ResponseData, ResponseMessage } from '../types/api.types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<ResponseData<TokenResponse>, LoginRequest>({
      query: (credentials) => {
        return {
          url: '/api/Authen/login',
          method: 'POST',
          body: credentials,
        };
      },
      transformResponse: (response: any, meta, arg) => {
        return response;
      },
      transformErrorResponse: (response: any, meta, arg) => {
        return response;
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    // Register
    register: builder.mutation<ResponseData<TokenResponse>, RegisterRequest>({
      query: (userData) => ({
        url: '/api/Authen/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Logout
    logout: builder.mutation<ResponseMessage, void>({
      query: () => ({
        url: '/api/Authen/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User', 'Cart', 'Order'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} = authApi;
