import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      const existingItem = state.items.find(
        (i) =>
          i.productId === item.productId &&
          JSON.stringify(i.attributes || {}) ===
            JSON.stringify(item.attributes || {})
      );

      const availableStock = item.availableStock ?? 0;

      if (existingItem) {
        const newQty = existingItem.quantity + item.quantity;
        if (newQty > availableStock) {
          toast.error(`Only ${availableStock} items in stock`);
          return;
        }
        existingItem.quantity = newQty;
      } else {
        if (item.quantity > availableStock) {
          console.log(
            "🔴 Item quantity exceeds available stock. Item not added to cart."
          );
          return;
        }
        state.items.push(item);
      }
    },

    // Direct Buy → replaces old cart → adds single item → redirect
    buyNow: (state, action) => {
      const newItem = action.payload;

      state.items = [newItem]; // clear & add only this one
    },

    incrementQuantity: (state, action) => {
      const { productId, attributes } = action.payload;

      const item = state.items.find(
        (i) =>
          i.productId === productId &&
          JSON.stringify(i.attributes || {}) ===
            JSON.stringify(attributes || {})
      );

      if (!item) return;

      // ✅ Detect stock from either variant or simple
      const maxQty =
        item.availableStock ?? item.variant?.quantity ?? item.stock ?? 0;

      if (item.quantity < maxQty) {
        item.quantity += 1;
      } else {
        console.warn(`⚠️ Stock limit reached (${maxQty})`);
        toast?.error(`Only ${maxQty} in stock`);
      }
    },

    // Decrement quantity
    decrementQuantity: (state, action) => {
      const { productId, attributes } = action.payload;

      const item = state.items.find(
        (i) =>
          i.productId === productId &&
          JSON.stringify(i.attributes || {}) ===
            JSON.stringify(attributes || {})
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    //  Remove one product
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
    },

    // 🧹 Clear all
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  buyNow,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
