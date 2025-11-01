import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

// cloudflared tunnel --url https://localhost:7087
// Get API_BASE_URL from environment variable
export const API_BASE_URL =
  "https://organic-meal-locations-copper.trycloudflare.com";

// Helper function to convert localhost URLs to Cloudflared URLs
export const convertImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";

  // If already an absolute URL (not localhost), return as-is
  if (/^https?:\/\//i.test(url)) return url;

  // Relative path starting with '/'
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;

  // Other relative path (no leading slash)
  return `${API_BASE_URL}/${url}`;
};

// Custom base query with token handling
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: 30000, // Increase timeout to 30 seconds
  prepareHeaders: async (headers) => {
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

// Base query with re-auth logic
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized - token expired
  if (result.error && result.error.status === 401) {
    // Clear token and user data
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    // You can dispatch a logout action here if needed
    // api.dispatch(logout());
  }

  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "User",
    "Seller",
    "Product",
    "Category",
    "Cart",
    "Order",
    "Review",
    "Location",
    "Banner",
  ],
  endpoints: () => ({}),
});

export default baseApi;
