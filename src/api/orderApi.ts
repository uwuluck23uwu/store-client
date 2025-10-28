import { baseApi } from './baseApi';
import { Order, OrderDetail, ResponseData, ResponseMessage } from '../types/api.types';

interface CreateOrderRequest {
  addressId: number;
  paymentMethod: string;
  notes?: string;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get my orders
    getMyOrders: builder.query<ResponseData<Order[]>, void>({
      query: () => '/order/my-orders',
      providesTags: [{ type: 'Order', id: 'LIST' }],
    }),

    // Get order detail
    getOrderDetail: builder.query<ResponseData<OrderDetail>, number>({
      query: (orderId) => `/order/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),

    // Create order
    createOrder: builder.mutation<ResponseData<Order>, CreateOrderRequest>({
      query: (data) => ({
        url: '/order',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Order', id: 'LIST' },
        { type: 'Cart', id: 'LIST' },
        { type: 'Cart', id: 'COUNT' },
      ],
    }),

    // Cancel order
    cancelOrder: builder.mutation<ResponseMessage, number>({
      query: (orderId) => ({
        url: `/order/${orderId}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: orderId },
      ],
    }),

    // Check if user has purchased a product
    checkProductPurchased: builder.query<ResponseData<boolean>, number>({
      query: (productId) => `/order/check-purchased/${productId}`,
      providesTags: (result, error, productId) => [
        { type: 'Order', id: `PURCHASED-${productId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyOrdersQuery,
  useGetOrderDetailQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useCheckProductPurchasedQuery,
} = orderApi;
