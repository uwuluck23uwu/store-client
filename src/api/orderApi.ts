import { baseApi } from './baseApi';
import { Order, OrderDetail, ResponseData, ResponseMessage } from '../types/api.types';

interface OrderItemCreateRequest {
  productId: number;
  quantity: number;
}

interface CreateOrderRequest {
  paymentMethod: string;
  notes?: string;
  items: OrderItemCreateRequest[];
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get my orders
    getMyOrders: builder.query<ResponseData<Order[]>, void>({
      query: () => '/api/order',
      providesTags: [{ type: 'Order', id: 'LIST' }],
    }),

    // Get order detail
    getOrderDetail: builder.query<ResponseData<OrderDetail>, number>({
      query: (orderId) => `/api/order/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),

    // Get all orders (Admin only)
    getAllOrders: builder.query<ResponseData<OrderDetail[]>, void>({
      query: () => '/api/order/all',
      providesTags: [{ type: 'Order', id: 'ALL' }],
    }),

    // Create order
    createOrder: builder.mutation<ResponseData<Order>, CreateOrderRequest>({
      query: (data) => ({
        url: '/api/order',
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
        url: `/api/order/${orderId}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: orderId },
      ],
    }),

    // Check if user has purchased a product
    checkProductPurchased: builder.query<ResponseData<boolean>, number>({
      query: (productId) => `/api/order/check-purchased/${productId}`,
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
  useGetAllOrdersQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useCheckProductPurchasedQuery,
} = orderApi;
