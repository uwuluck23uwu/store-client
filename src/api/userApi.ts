import { baseApi, API_BASE_URL } from './baseApi';
import { User, ResponseData, ResponseMessage } from '../types/api.types';

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface ChangeRoleRequest {
  role: string; // "Customer", "Seller", "Admin"
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user profile
    getProfile: builder.query<ResponseData<User>, void>({
      query: () => '/api/User/profile',
      transformResponse: (response: any) => {
        // Transform image URL to full URL
        if (response?.data?.imageUrl && !response.data.imageUrl.startsWith('http')) {
          return {
            ...response,
            data: {
              ...response.data,
              imageUrl: `${API_BASE_URL}${response.data.imageUrl}`,
            },
          };
        }
        return response;
      },
      providesTags: ['User'],
    }),

    // Get user by ID (for seller info)
    getUserById: builder.query<ResponseData<User>, number>({
      query: (userId) => `/api/User/${userId}`,
      transformResponse: (response: any) => {
        // Transform image URL to full URL
        if (response?.data?.imageUrl && !response.data.imageUrl.startsWith('http')) {
          return {
            ...response,
            data: {
              ...response.data,
              imageUrl: `${API_BASE_URL}${response.data.imageUrl}`,
            },
          };
        }
        return response;
      },
    }),

    // Update user profile
    updateProfile: builder.mutation<ResponseMessage, UpdateProfileRequest>({
      query: (data) => ({
        url: '/api/User/update',
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['User'],
    }),

    // Upload profile picture
    uploadAvatar: builder.mutation<ResponseData<string>, FormData>({
      query: (formData) => {
        // Create a custom Headers object and delete Content-Type
        // to let FormData set multipart/form-data with boundary automatically
        return {
          url: '/api/User/upload-avatar',
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type - browser will set multipart/form-data automatically
          },
        };
      },
      transformResponse: (response: any) => {
        // Transform avatar URL to full URL
        // Backend returns the imageUrl as a string in the data field
        if (response?.data && typeof response.data === 'string' && !response.data.startsWith('http')) {
          return {
            ...response,
            data: `${API_BASE_URL}${response.data}`,
          };
        }
        return response;
      },
      invalidatesTags: ['User'],
    }),

    // Change user role
    changeRole: builder.mutation<ResponseMessage, ChangeRoleRequest>({
      query: (data) => ({
        url: '/api/User/change-role',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProfileQuery,
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useChangeRoleMutation,
} = userApi;
