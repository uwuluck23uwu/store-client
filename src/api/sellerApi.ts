import { baseApi, API_BASE_URL } from './baseApi';
import { Seller, ResponseData, ResponseMessage } from '../types/api.types';

export interface UpdateSellerInfoRequest {
  shopName?: string;
  shopDescription?: string;
  phoneNumber?: string;
  address?: string;
  shopImageUrl?: string;
  logoUrl?: string;
  qrCodeUrl?: string;
}

export interface CreateSellerRequest {
  shopName: string;
  shopDescription?: string;
  phoneNumber?: string;
  address?: string;
}

export const sellerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get seller info for current user by userId
    getSellerInfo: builder.query<ResponseData<Seller>, number>({
      query: (userId) => `/api/seller/user/${userId}`,
      transformResponse: (response: any) => {
        // Transform image URLs to full URLs
        if (response?.data) {
          const data = response.data;
          return {
            ...response,
            data: {
              ...data,
              shopImageUrl: data.shopImageUrl && !data.shopImageUrl.startsWith('http')
                ? `${API_BASE_URL}${data.shopImageUrl}`
                : data.shopImageUrl,
              logoUrl: data.logoUrl && !data.logoUrl.startsWith('http')
                ? `${API_BASE_URL}${data.logoUrl}`
                : data.logoUrl,
              qrCodeUrl: data.qrCodeUrl && !data.qrCodeUrl.startsWith('http')
                ? `${API_BASE_URL}${data.qrCodeUrl}`
                : data.qrCodeUrl,
            },
          };
        }
        return response;
      },
      providesTags: ['Seller'],
    }),

    // Get seller by ID
    getSellerById: builder.query<ResponseData<Seller>, number>({
      query: (sellerId) => `/api/Seller/${sellerId}`,
      transformResponse: (response: any) => {
        // Transform image URLs to full URLs
        if (response?.data) {
          const data = response.data;
          return {
            ...response,
            data: {
              ...data,
              shopImageUrl: data.shopImageUrl && !data.shopImageUrl.startsWith('http')
                ? `${API_BASE_URL}${data.shopImageUrl}`
                : data.shopImageUrl,
              logoUrl: data.logoUrl && !data.logoUrl.startsWith('http')
                ? `${API_BASE_URL}${data.logoUrl}`
                : data.logoUrl,
              qrCodeUrl: data.qrCodeUrl && !data.qrCodeUrl.startsWith('http')
                ? `${API_BASE_URL}${data.qrCodeUrl}`
                : data.qrCodeUrl,
            },
          };
        }
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'Seller', id }],
    }),

    // Create new seller
    createSeller: builder.mutation<ResponseData<Seller>, CreateSellerRequest>({
      query: (data) => ({
        url: '/api/Seller',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Seller'],
    }),

    // Update seller info
    updateSellerInfo: builder.mutation<ResponseMessage, { sellerId: number; data: UpdateSellerInfoRequest }>({
      query: ({ sellerId, data }) => ({
        url: `/api/seller/${sellerId}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Seller'],
    }),

    // Upload shop image
    uploadShopImage: builder.mutation<ResponseData<string>, FormData>({
      query: (formData) => ({
        url: '/api/Seller/upload-shop-image',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Seller'],
    }),

    // Upload logo
    uploadLogo: builder.mutation<ResponseData<string>, FormData>({
      query: (formData) => ({
        url: '/api/Seller/upload-logo',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Seller'],
    }),

    // Upload QR Code
    uploadQRCode: builder.mutation<ResponseData<string>, FormData>({
      query: (formData) => ({
        url: '/api/Seller/upload-qrcode',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Seller'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSellerInfoQuery,
  useGetSellerByIdQuery,
  useCreateSellerMutation,
  useUpdateSellerInfoMutation,
  useUploadShopImageMutation,
  useUploadLogoMutation,
  useUploadQRCodeMutation,
} = sellerApi;
