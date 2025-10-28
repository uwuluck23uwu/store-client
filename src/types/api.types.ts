// Response wrappers
export interface ResponseData<T> {
  isSuccess: boolean;
  data?: T;
  message: string;
}

export interface ResponseMessage {
  isSuccess: boolean;
  message: string;
}

// User & Auth
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  imageUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Seller
export interface Seller {
  sellerId: number;
  userId: number;
  shopName?: string;
  shopDescription?: string;
  shopImageUrl?: string;
  logoUrl?: string;
  qrCodeUrl?: string;
  description?: string;
  phoneNumber?: string;
  address?: string;
  rating?: number;
  totalSales?: number;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  ownerName?: string;
  userEmail?: string;
}

// Product & Category
export interface Product {
  productId: number;
  productName: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  imageUrl?: string;
  rating?: number;
  categoryId: number;
  categoryName?: string;
  sellerId: number;
  sellerName?: string;
  seller?: Seller;
  isActive: boolean;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  isActive: boolean;
}

// Cart
export interface CartItem {
  cartId: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  imageUrl?: string;
  productImage?: string; // Computed field for compatibility
  price: number;
  quantity: number;
  stock: number;
  unit?: string;
  isActive?: boolean;
  sellerId?: number;
  sellerName?: string;
  categoryName?: string;
  subtotal?: number;
  addedAt?: string;
}

// Order
export interface Order {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  shippingFee: number;
  status: string;
  paymentStatus: string;
  orderDate: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  shippingAddress: Address;
}

export interface OrderItem {
  orderItemId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Address
export interface Address {
  addressId: number;
  receiverName: string;
  phoneNumber: string;
  addressLine1: string;
  district: string;
  subdistrict: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

// Location
export interface Location {
  id: number;
  locationId: string;
  locationName: string;
  description?: string;
  locationType: string;
  latitude: number;
  longitude: number;
  address?: string;
  phoneNumber?: string;
  imageUrl?: string;
  iconUrl?: string;
  iconColor?: string;
  sellerId?: number;
  sellerName?: string;
  isActive?: boolean;
  createdAt?: string;
}

// Review
export interface Review {
  reviewId: number;
  productId: number;
  userId: number;
  userName?: string;
  userImageUrl?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export interface ReviewCreateRequest {
  productId: number;
  rating: number;
  comment?: string;
}

export interface ReviewUpdateRequest {
  rating?: number;
  comment?: string;
}
