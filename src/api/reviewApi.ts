import { baseApi } from './baseApi';
import { Review, ProductReviewsResponse, ReviewCreateRequest, ReviewUpdateRequest, ResponseData, ResponseMessage } from '../types/api.types';

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get reviews for a product
    getProductReviews: builder.query<ResponseData<ProductReviewsResponse>, number>({
      query: (productId) => `/api/review/product/${productId}`,
      providesTags: (result, error, productId) => [
        { type: 'Review', id: `PRODUCT-${productId}` },
      ],
    }),

    // Get a specific review
    getReview: builder.query<ResponseData<Review>, number>({
      query: (reviewId) => `/api/review/${reviewId}`,
      providesTags: (result, error, reviewId) => [{ type: 'Review', id: reviewId }],
    }),

    // Get user's review for a product
    getUserProductReview: builder.query<ResponseData<Review>, number>({
      query: (productId) => `/api/review/user/product/${productId}`,
      providesTags: (result, error, productId) => [
        { type: 'Review', id: `USER-PRODUCT-${productId}` },
      ],
    }),

    // Create a review
    createReview: builder.mutation<ResponseMessage, ReviewCreateRequest>({
      query: (data) => ({
        url: '/api/review',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: `PRODUCT-${productId}` },
        { type: 'Review', id: `USER-PRODUCT-${productId}` },
        { type: 'Product', id: productId },
      ],
    }),

    // Update a review
    updateReview: builder.mutation<ResponseMessage, { reviewId: number; data: ReviewUpdateRequest }>({
      query: ({ reviewId, data }) => ({
        url: `/api/review/${reviewId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: 'Review', id: reviewId },
        { type: 'Review', id: 'LIST' },
      ],
    }),

    // Delete a review
    deleteReview: builder.mutation<ResponseMessage, number>({
      query: (reviewId) => ({
        url: `/api/review/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, reviewId) => [
        { type: 'Review', id: reviewId },
        { type: 'Review', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductReviewsQuery,
  useGetReviewQuery,
  useGetUserProductReviewQuery,
  useLazyGetUserProductReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
