"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Product, CartItem } from "@/lib/types";

/* ─────────────────────────────────────────────
   State shape
───────────────────────────────────────────── */
interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
}

/* ─────────────────────────────────────────────
   Actions
───────────────────────────────────────────── */
type CartAction =
  | { type: "ADD_ITEM";      product: Product; quantity?: number; customization?: Record<string, string> }
  | { type: "REMOVE_ITEM";   productId: string }
  | { type: "UPDATE_QTY";    productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "HYDRATE";       items: CartItem[] };

/* ─────────────────────────────────────────────
   Reducer
───────────────────────────────────────────── */
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {

    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id &&
               JSON.stringify(i.customization) === JSON.stringify(action.customization)
      );
      const addQty = action.quantity ?? 1;

      const items = existing
        ? state.items.map((i) =>
            i.product.id === action.product.id &&
            JSON.stringify(i.customization) === JSON.stringify(action.customization)
              ? { ...i, quantity: i.quantity + addQty }
              : i
          )
        : [...state.items, { 
            product: action.product, 
            quantity: addQty,
            customization: action.customization 
          }];

      // Silent add — badge increments only, drawer stays closed
      return { ...state, items, isDrawerOpen: false };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.product.id !== action.productId),
      };

    case "UPDATE_QTY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product.id !== action.productId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "OPEN_DRAWER":
      return { ...state, isDrawerOpen: true };

    case "CLOSE_DRAWER":
      return { ...state, isDrawerOpen: false };

    case "HYDRATE":
      return { ...state, items: action.items };

    default:
      return state;
  }
}

/* ─────────────────────────────────────────────
   Derived helpers
───────────────────────────────────────────── */
const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 0; // Free shipping for all orders

export function calcSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}

export function calcShipping(subtotal: number) {
  return 0; // Always free shipping
}

export function calcTotal(subtotal: number, shipping: number) {
  return subtotal + shipping;
}

export function calcItemCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

/* ─────────────────────────────────────────────
   Context
───────────────────────────────────────────── */
interface CartContextValue {
  items: CartItem[];
  isDrawerOpen: boolean;
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addItem:    (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQty:  (productId: string, quantity: number) => void;
  clearCart:  () => void;
  openDrawer:  () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "mmm_cart";

/* ─────────────────────────────────────────────
   Provider
───────────────────────────────────────────── */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isDrawerOpen: false,
  });

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CartItem[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: "HYDRATE", items: parsed });
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  /* Persist to localStorage on every change */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore storage errors (private browsing, quota exceeded)
    }
  }, [state.items]);

  const subtotal  = calcSubtotal(state.items);
  const shipping  = calcShipping(subtotal);
  const total     = calcTotal(subtotal, shipping);
  const itemCount = calcItemCount(state.items);

  const addItem    = useCallback((product: Product, quantity = 1, customization?: Record<string, string>) =>
    dispatch({ type: "ADD_ITEM", product, quantity, customization }), []);
  const removeItem = useCallback((productId: string) =>
    dispatch({ type: "REMOVE_ITEM", productId }), []);
  const updateQty  = useCallback((productId: string, quantity: number) =>
    dispatch({ type: "UPDATE_QTY", productId, quantity }), []);
  const clearCart  = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const openDrawer  = useCallback(() => dispatch({ type: "OPEN_DRAWER" }), []);
  const closeDrawer = useCallback(() => dispatch({ type: "CLOSE_DRAWER" }), []);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isDrawerOpen: state.isDrawerOpen,
        itemCount,
        subtotal,
        shipping,
        total,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ─────────────────────────────────────────────
   Hook
───────────────────────────────────────────── */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
