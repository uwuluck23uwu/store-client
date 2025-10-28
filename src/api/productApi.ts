import { baseApi, API_BASE_URL } from './baseApi';
import { Product, Category, ResponseData } from '../types/api.types';

interface ProductListParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  sellerId?: number;
}

// Product create/update DTOs
interface ProductCreateDTO {
  productName: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  categoryId: number;
  image?: any; // File object
}

interface ProductUpdateDTO {
  productName?: string;
  description?: string;
  price?: number;
  stock?: number;
  unit?: string;
  categoryId?: number;
  image?: any; // File object
  isActive?: boolean;
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products
    getProducts: builder.query<ResponseData<Product[]>, ProductListParams | void>({
      query: (params) => {
        if (params) {
          return {
            url: '/api/product',
            method: 'GET',
            params,
          };
        }
        return '/api/product';
      },
      transformResponse: (response: any) => {
        // Backend returns { data: { products: [...], pageNumber, pageSize, ... } }
        // We need to extract the products array
        // Check both PascalCase (old) and camelCase (new) for backwards compatibility
        const productsArray = response?.data?.products || response?.data?.Products;

        if (productsArray) {
          // Transform imageUrl to full URL
          const productsWithFullImageUrl = productsArray.map((product: any) => ({
            ...product,
            imageUrl: product.imageUrl && !product.imageUrl.startsWith('http')
              ? `${API_BASE_URL}${product.imageUrl}`
              : product.imageUrl,
          }));

          const transformedData = {
            ...response,
            data: productsWithFullImageUrl,
          };
          return transformedData;
        }

        return response;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ productId }) => ({ type: 'Product' as const, id: productId })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // Get product by ID
    getProduct: builder.query<ResponseData<Product>, number>({
      query: (id) => `/api/product/${id}`,
      transformResponse: (response: any) => {
        // Transform imageUrl to full URL
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
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Search products
    searchProducts: builder.query<ResponseData<Product[]>, string>({
      query: (keyword) => ({
        url: '/api/product/search',
        params: { keyword },
      }),
      transformResponse: (response: any) => {
        // Transform imageUrl to full URL for search results
        if (response?.data && Array.isArray(response.data)) {
          const productsWithFullImageUrl = response.data.map((product: any) => ({
            ...product,
            imageUrl: product.imageUrl && !product.imageUrl.startsWith('http')
              ? `${API_BASE_URL}${product.imageUrl}`
              : product.imageUrl,
          }));

          return {
            ...response,
            data: productsWithFullImageUrl,
          };
        }
        return response;
      },
      providesTags: [{ type: 'Product', id: 'SEARCH' }],
    }),

    // Get products by category
    getProductsByCategory: builder.query<ResponseData<Product[]>, number>({
      query: (categoryId) => `/api/product/category/${categoryId}`,
      transformResponse: (response: any) => {
        // Transform imageUrl to full URL for category products
        if (response?.data && Array.isArray(response.data)) {
          const productsWithFullImageUrl = response.data.map((product: any) => ({
            ...product,
            imageUrl: product.imageUrl && !product.imageUrl.startsWith('http')
              ? `${API_BASE_URL}${product.imageUrl}`
              : product.imageUrl,
          }));

          return {
            ...response,
            data: productsWithFullImageUrl,
          };
        }
        return response;
      },
      providesTags: (result, error, categoryId) => [
        { type: 'Product', id: `CATEGORY-${categoryId}` },
      ],
    }),

    // Create product (Admin/Seller)
    createProduct: builder.mutation<ResponseData<Product>, ProductCreateDTO>({
      query: (data) => {
        const formData = new FormData();
        formData.append('productName', data.productName);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('stock', data.stock.toString());
        formData.append('unit', data.unit);
        formData.append('categoryId', data.categoryId.toString());

        if (data.image) {
          formData.append('image', data.image);
        }

        return {
          url: '/api/product',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // Update product (Admin/Seller)
    updateProduct: builder.mutation<ResponseData<Product>, { id: number; data: ProductUpdateDTO }>({
      query: ({ id, data }) => {
        const formData = new FormData();

        if (data.productName !== undefined) formData.append('productName', data.productName);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.price !== undefined) formData.append('price', data.price.toString());
        if (data.stock !== undefined) formData.append('stock', data.stock.toString());
        if (data.unit !== undefined) formData.append('unit', data.unit);
        if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId.toString());
        if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
        if (data.image) formData.append('image', data.image);

        return {
          url: `/api/product/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // Delete product (Admin/Seller)
    deleteProduct: builder.mutation<ResponseData<void>, number>({
      query: (id) => ({
        url: `/api/product/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    getCategories: builder.query<ResponseData<Category[]>, void>({
      query: () => '/api/category',
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    // Get active categories only
    getActiveCategories: builder.query<ResponseData<Category[]>, void>({
      query: () => '/api/category/active',
      providesTags: [{ type: 'Category', id: 'ACTIVE' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useSearchProductsQuery,
  useGetProductsByCategoryQuery,
  useLazyGetProductsQuery,
  useLazySearchProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;

export const {
  useGetCategoriesQuery,
  useGetActiveCategoriesQuery,
} = categoryApi;
