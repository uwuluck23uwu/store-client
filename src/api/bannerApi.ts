import { baseApi, API_BASE_URL } from './baseApi';
import { ResponseData, ResponseMessage } from '../types/api.types';

// Banner types
export interface AppBanner {
  appBannerId: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BannerCreateDTO {
  title?: string;
  image: any; // File object
  linkUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface BannerUpdateDTO {
  title?: string;
  image?: any; // File object
  linkUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all banners (Admin only)
    getAllBanners: builder.query<ResponseData<AppBanner[]>, void>({
      query: () => '/api/appbanner',
      transformResponse: (response: any) => {
        if (response?.data) {
          // Transform imageUrl to full URL
          const bannersWithFullImageUrl = response.data.map((banner: AppBanner) => ({
            ...banner,
            imageUrl: banner.imageUrl && !banner.imageUrl.startsWith('http')
              ? `${API_BASE_URL}${banner.imageUrl}`
              : banner.imageUrl,
          }));

          return {
            ...response,
            data: bannersWithFullImageUrl,
          };
        }
        return response;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ appBannerId }) => ({ type: 'Banner' as const, id: appBannerId })),
              { type: 'Banner', id: 'LIST' },
            ]
          : [{ type: 'Banner', id: 'LIST' }],
    }),

    // Get active banners (Public)
    getActiveBanners: builder.query<ResponseData<AppBanner[]>, void>({
      query: () => '/api/appbanner/active',
      transformResponse: (response: any) => {
        if (response?.data) {
          // Transform imageUrl to full URL
          const bannersWithFullImageUrl = response.data.map((banner: AppBanner) => ({
            ...banner,
            imageUrl: banner.imageUrl && !banner.imageUrl.startsWith('http')
              ? `${API_BASE_URL}${banner.imageUrl}`
              : banner.imageUrl,
          }));

          return {
            ...response,
            data: bannersWithFullImageUrl,
          };
        }
        return response;
      },
      providesTags: [{ type: 'Banner', id: 'ACTIVE' }],
    }),

    // Get banner by ID (Admin only)
    getBanner: builder.query<ResponseData<AppBanner>, number>({
      query: (id) => `/api/appbanner/${id}`,
      transformResponse: (response: any) => {
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
      providesTags: (result, error, id) => [{ type: 'Banner', id }],
    }),

    // Create banner (Admin only)
    createBanner: builder.mutation<ResponseMessage, BannerCreateDTO>({
      query: (dto) => {
        const formData = new FormData();

        if (dto.title) formData.append('title', dto.title);
        if (dto.image) formData.append('image', dto.image);
        if (dto.linkUrl) formData.append('linkUrl', dto.linkUrl);
        if (dto.displayOrder !== undefined) formData.append('displayOrder', dto.displayOrder.toString());
        if (dto.isActive !== undefined) formData.append('isActive', dto.isActive.toString());

        return {
          url: '/api/appbanner',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [{ type: 'Banner', id: 'LIST' }, { type: 'Banner', id: 'ACTIVE' }],
    }),

    // Update banner (Admin only)
    updateBanner: builder.mutation<ResponseMessage, { id: number; data: BannerUpdateDTO }>({
      query: ({ id, data }) => {
        const formData = new FormData();

        if (data.title !== undefined) formData.append('title', data.title);
        if (data.image) formData.append('image', data.image);
        if (data.linkUrl !== undefined) formData.append('linkUrl', data.linkUrl);
        if (data.displayOrder !== undefined) formData.append('displayOrder', data.displayOrder.toString());
        if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

        return {
          url: `/api/appbanner/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Banner', id },
        { type: 'Banner', id: 'LIST' },
        { type: 'Banner', id: 'ACTIVE' },
      ],
    }),

    // Delete banner (Admin only)
    deleteBanner: builder.mutation<ResponseMessage, number>({
      query: (id) => ({
        url: `/api/appbanner/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Banner', id: 'LIST' }, { type: 'Banner', id: 'ACTIVE' }],
    }),

    // Toggle banner active status (Admin only)
    toggleBannerStatus: builder.mutation<ResponseMessage, number>({
      query: (id) => ({
        url: `/api/appbanner/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Banner', id },
        { type: 'Banner', id: 'LIST' },
        { type: 'Banner', id: 'ACTIVE' },
      ],
    }),

    // Update banner display order (Admin only)
    updateBannerDisplayOrder: builder.mutation<ResponseMessage, { id: number; displayOrder: number }>({
      query: ({ id, displayOrder }) => ({
        url: `/api/appbanner/${id}/display-order`,
        method: 'PATCH',
        body: displayOrder,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Banner', id },
        { type: 'Banner', id: 'LIST' },
        { type: 'Banner', id: 'ACTIVE' },
      ],
    }),
  }),
});

export const {
  useGetAllBannersQuery,
  useGetActiveBannersQuery,
  useGetBannerQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation,
  useUpdateBannerDisplayOrderMutation,
} = bannerApi;
