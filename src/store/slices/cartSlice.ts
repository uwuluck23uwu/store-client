import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types/api.types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      const items = Array.isArray(action.payload) ? action.payload : [];
      state.items = items;
      state.totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.cartId === action.payload.cartId);
      if (!existingItem) {
        state.items.push(action.payload);
      }
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    updateItemQuantity: (state, action: PayloadAction<{ cartId: number; quantity: number }>) => {
      const item = state.items.find(item => item.cartId === action.payload.cartId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.cartId !== action.payload);
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCartItems, addItem, updateItemQuantity, removeItem, clearCart, setLoading } = cartSlice.actions;
export default cartSlice.reducer;
