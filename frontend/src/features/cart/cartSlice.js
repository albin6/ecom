import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
  shippingAddress: localStorage.getItem('shippingAddress') ? JSON.parse(localStorage.getItem('shippingAddress')) : {},
  paymentMethod: 'PayPal',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      // Enforce stock limit (max 10 per variant for consumer safety)
      const maxAllowed = item.stock ? Math.min(item.stock, 10) : 10;
      item.qty = Math.min(item.qty, maxAllowed);

      const existItem = state.cartItems.find((x) => 
        x.product === item.product && x.color === item.color && x.size === item.size
      );

      if (existItem) {
        state.cartItems = state.cartItems.map((x) => 
          (x.product === existItem.product && x.color === existItem.color && x.size === existItem.size) ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      const { product, color, size } = action.payload;
      state.cartItems = state.cartItems.filter(
        (x) => !(x.product === product && x.color === color && x.size === size)
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', JSON.stringify(action.payload));
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
    setCart: (state, action) => {
      state.cartItems = action.payload;
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    }
  },
});

export const { addToCart, removeFromCart, saveShippingAddress, savePaymentMethod, clearCartItems, setCart } = cartSlice.actions;

export default cartSlice.reducer;
