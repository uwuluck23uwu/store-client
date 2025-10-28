import { baseApi } from './baseApi';
import { Location, ResponseData, ResponseMessage } from '../types/api.types';

interface NearbyParams {
  latitude: number;
  longitude: number;
  radius?: number;
}

interface CreateLocationRequest {
  refId?: string;
  locationName: string;
  description?: string;
  locationType?: string;
  latitude: number;
  longitude: number;
  address?: string;
  phoneNumber?: string;
  imageUrl?: string;
  iconUrl?: string;
  iconColor?: string;
  sellerId?: number;
  isActive?: boolean;
}

interface UpdateLocationRequest {
  refId?: string;
  locationName?: string;
  description?: string;
  locationType?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  phoneNumber?: string;
  imageUrl?: string;
  iconUrl?: string;
  iconColor?: string;
  isActive?: boolean;
}

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all locations
    getLocations: builder.query<ResponseData<Location[]>, void>({
      query: () => '/api/Location',
      providesTags: [{ type: 'Location', id: 'LIST' }],
    }),

    // Get location by ID
    getLocation: builder.query<ResponseData<Location>, number>({
      query: (id) => `/api/Location/${id}`,
      providesTags: (result, error, id) => [{ type: 'Location', id }],
    }),

    // Get nearby locations
    getNearbyLocations: builder.query<ResponseData<Location[]>, NearbyParams>({
      query: ({ latitude, longitude, radius = 5 }) => ({
        url: '/api/Location/nearby',
        params: { latitude, longitude, radiusKm: radius },
      }),
      providesTags: [{ type: 'Location', id: 'NEARBY' }],
    }),

    // Create new location (Admin/Seller only)
    createLocation: builder.mutation<ResponseData<number>, CreateLocationRequest>({
      query: (body) => ({
        url: '/api/Location',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Location', id: 'LIST' }],
    }),

    // Update location (Admin/Seller only)
    updateLocation: builder.mutation<ResponseMessage, { refId: string; data: UpdateLocationRequest }>({
      query: ({ refId, data }) => ({
        url: `/api/Location/${refId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'Location', id: 'LIST' }],
    }),

    // Delete location (Admin only)
    deleteLocation: builder.mutation<ResponseMessage, number>({
      query: (id) => ({
        url: `/api/Location/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Location', id: 'LIST' }],
    }),

    // Upload location image
    uploadLocationImage: builder.mutation<ResponseData<string>, { locationId: number; formData: FormData }>({
      query: ({ locationId, formData }) => ({
        url: `/api/Location/${locationId}/upload-image`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Location', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLocationsQuery,
  useGetLocationQuery,
  useGetNearbyLocationsQuery,
  useLazyGetNearbyLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useUploadLocationImageMutation,
} = locationApi;
