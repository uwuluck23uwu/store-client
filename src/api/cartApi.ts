import { baseApi, API_BASE_URL } from './baseApi';
import { CartItem, ResponseData, ResponseMessage } from '../types/api.types';

interface AddToCartRequest {
  productId: number;
  quantity: number;
}

interface UpdateCartQuantityRequest {
  cartId: number;
  quantity: number;
}

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get my cart
    getCart: builder.query<ResponseData<CartItem[]>, void>({
      query: () => '/api/cart',
      transformResponse: (response: any) => {
        // Backend returns data in format: { data: { Items: [...], Total: 0, ItemCount: 0 } }
        // We need to extract Items array from the nested data structure
        if (response && response.data) {
          const items = response.data.Items || response.data.items || response.data;
          const itemsArray = Array.isArray(items) ? items : [];

          // Map image fields for compatibility and transform to full URL
          const mappedItems = itemsArray.map((item: any) => {
            const imageUrl = item.productImageUrl || item.imageUrl || item.productImage;
            return {
              ...item,
              productImage: imageUrl && !imageUrl.startsWith('http')
                ? `${API_BASE_URL}${imageUrl}`
                : imageUrl,
            };
          });

          return {
            ...response,
            data: mappedItems,
          };
        }
        return { ...response, data: [] };
      },
      providesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // Get cart count
    getCartCount: builder.query<ResponseData<number>, void>({
      query: () => '/api/cart/count',
      providesTags: [{ type: 'Cart', id: 'COUNT' }],
    }),

    // Add to cart
    addToCart: builder.mutation<ResponseMessage, AddToCartRequest>({
      query: (data) => ({
        url: '/api/cart',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      }),
      invalidatesTags: [
        { type: 'Cart', id: 'LIST' },
        { type: 'Cart', id: 'COUNT' },
      ],
    }),

    // Update cart quantity
    updateCartQuantity: builder.mutation<ResponseMessage, UpdateCartQuantityRequest>({
      query: ({ cartId, quantity }) => ({
        url: `/api/cart/${cartId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: [
        { type: 'Cart', id: 'LIST' },
        { type: 'Cart', id: 'COUNT' },
      ],
    }),

    // Remove from cart
    removeFromCart: builder.mutation<ResponseMessage, number>({
      query: (cartId) => ({
        url: `/api/cart/${cartId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Cart', id: 'LIST' },
        { type: 'Cart', id: 'COUNT' },
      ],
    }),

    // Clear cart
    clearCart: builder.mutation<ResponseMessage, void>({
      query: () => ({
        url: '/api/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Cart', id: 'LIST' },
        { type: 'Cart', id: 'COUNT' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCartQuery,
  useGetCartCountQuery,
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
