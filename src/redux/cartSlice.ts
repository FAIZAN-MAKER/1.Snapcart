import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface IGrocery {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ICartItem extends IGrocery {
  quantity: number;
}

interface ICartSlice {
  items: ICartItem[];
  subtotal: number;
  deliveryFee: number;
  finalTotal: number;
}

const DEFAULT_DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 300;

const initialState: ICartSlice = {
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  finalTotal: 0,
};

const getId = (item: IGrocery) => item._id?.toString() ?? item.name;

const calculateTotals = (state: ICartSlice) => {
  state.subtotal = state.items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  );
  state.deliveryFee =
    state.items.length === 0
      ? 0
      : state.subtotal >= FREE_DELIVERY_THRESHOLD
        ? 0
        : DEFAULT_DELIVERY_FEE;
  state.finalTotal = state.subtotal + state.deliveryFee;
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<IGrocery>) => {
      const serializableItem = {
        ...action.payload,
        _id: action.payload._id?.toString(),
        createdAt: action.payload.createdAt?.toString(),
        updatedAt: action.payload.updatedAt?.toString(),
      };
      const id = getId(serializableItem);
      const existing = state.items.find((i) => getId(i) === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...serializableItem, quantity: 1 });
      }
      calculateTotals(state);
    },

    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => getId(i) === action.payload);
      if (item) {
        item.quantity += 1;
        calculateTotals(state);
      }
    },

    decrementQuantity: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex((i) => getId(i) === action.payload);
      if (index === -1) return;
      if (state.items[index].quantity <= 1) {
        state.items.splice(index, 1);
      } else {
        state.items[index].quantity -= 1;
      }
      calculateTotals(state);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => getId(i) !== action.payload);
      calculateTotals(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.finalTotal = 0;
    },

    setQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const item = state.items.find((i) => getId(i) === action.payload.id);
      if (!item) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((i) => getId(i) !== action.payload.id);
      } else {
        item.quantity = action.payload.quantity;
      }
      calculateTotals(state);
    },
  },
});

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCartItems = (state: { cart: ICartSlice }) =>
  state.cart.items;
export const selectCartSubtotal = (state: { cart: ICartSlice }) =>
  state.cart.subtotal;
export const selectDeliveryFee = (state: { cart: ICartSlice }) =>
  state.cart.deliveryFee;
export const selectFinalTotal = (state: { cart: ICartSlice }) =>
  state.cart.finalTotal;

// ✅ counts unique products only — not total quantity
export const selectCartCount = (state: { cart: ICartSlice }) =>
  state.cart.items.length;

export const selectItemQuantity =
  (id: string) => (state: { cart: ICartSlice }) =>
    state.cart.items.find((i) => getId(i) === id)?.quantity ?? 0;

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  setQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
