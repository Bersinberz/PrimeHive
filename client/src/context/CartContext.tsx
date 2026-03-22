import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import * as cartService from "../services/storefront/cartService";
import type { CartItem } from "../services/storefront/cartService";

// ── Types ──────────────────────────────────────────────────────────────────

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  addItem: (productId: string, name: string, price: number, image: string, stock: number, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  savedItems: CartItem[];
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  removeSaved: (productId: string) => void;
}

// ── Local Storage Helpers ──────────────────────────────────────────────────

const GUEST_CART_KEY = "primehive_guest_cart";
const SAVED_LATER_KEY = "primehive_saved_later";

const loadGuestCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items: CartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};

const loadSavedLater = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(SAVED_LATER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persistSavedLater = (items: CartItem[]) => {
  localStorage.setItem(SAVED_LATER_KEY, JSON.stringify(items));
};

// ── Context ────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

// ── Provider ───────────────────────────────────────────────────────────────

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedItems, setSavedItems] = useState<CartItem[]>(loadSavedLater);

  // ── Load cart on auth state change ──────────────────────────────────────

  useEffect(() => {
    const initCart = async () => {
      if (isAuthenticated && user?.role === "user") {
        setLoading(true);
        try {
          // Merge guest cart into server cart
          const guestItems = loadGuestCart();
          if (guestItems.length > 0) {
            const syncPayload = guestItems.map((i) => ({
              productId: i.product,
              quantity: i.quantity,
            }));
            const merged = await cartService.syncCart(syncPayload);
            setItems(merged.items || []);
            clearGuestCart();
          } else {
            const cart = await cartService.getCart();
            setItems(cart.items || []);
          }
        } catch {
          // Fallback to guest cart if server fails
          setItems(loadGuestCart());
        } finally {
          setLoading(false);
        }
      } else if (!isAuthenticated) {
        // Guest mode — load from localStorage
        setItems(loadGuestCart());
      }
    };

    initCart();
  }, [isAuthenticated, user]);

  // ── Persist guest cart to localStorage ──────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "user") {
      saveGuestCart(items);
    }
  }, [items, isAuthenticated, user]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const isLoggedInUser = isAuthenticated && user?.role === "user";

  const addItem = useCallback(
    async (productId: string, name: string, price: number, image: string, stock: number, quantity = 1) => {
      if (isLoggedInUser) {
        setLoading(true);
        try {
          const cart = await cartService.addToCart(productId, quantity);
          setItems(cart.items || []);
        } finally {
          setLoading(false);
        }
      } else {
        // Guest: update localStorage
        setItems((prev) => {
          const existing = prev.find((i) => i.product === productId);
          if (existing) {
            return prev.map((i) =>
              i.product === productId
                ? { ...i, quantity: Math.min(i.quantity + quantity, stock) }
                : i
            );
          }
          return [...prev, { product: productId, name, price, image, quantity: Math.min(quantity, stock), stock }];
        });
      }
    },
    [isLoggedInUser]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (isLoggedInUser) {
        setLoading(true);
        try {
          const cart = await cartService.removeCartItem(productId);
          setItems(cart.items || []);
        } finally {
          setLoading(false);
        }
      } else {
        setItems((prev) => prev.filter((i) => i.product !== productId));
      }
    },
    [isLoggedInUser]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity < 1) return removeItem(productId);

      if (isLoggedInUser) {
        setLoading(true);
        try {
          const cart = await cartService.updateCartItem(productId, quantity);
          setItems(cart.items || []);
        } finally {
          setLoading(false);
        }
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.product === productId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          )
        );
      }
    },
    [isLoggedInUser, removeItem]
  );

  const clearCart = useCallback(async () => {
    if (isLoggedInUser) {
      await cartService.clearServerCart();
    }
    setItems([]);
    clearGuestCart();
  }, [isLoggedInUser]);

  // ── Save for Later ───────────────────────────────────────────────────────

  useEffect(() => {
    persistSavedLater(savedItems);
  }, [savedItems]);

  const saveForLater = useCallback((productId: string) => {
    setItems(prev => {
      const item = prev.find(i => i.product === productId);
      if (!item) return prev;
      setSavedItems(s => s.find(i => i.product === productId) ? s : [...s, { ...item, quantity: 1 }]);
      return prev.filter(i => i.product !== productId);
    });
    // Also remove from server cart if logged in
    if (isLoggedInUser) {
      cartService.removeCartItem(productId).catch(() => {});
    }
  }, [isLoggedInUser]);

  const moveToCart = useCallback((productId: string) => {
    setSavedItems(prev => {
      const item = prev.find(i => i.product === productId);
      if (!item) return prev;
      setItems(cart => {
        const exists = cart.find(i => i.product === productId);
        const updated = exists
          ? cart.map(i => i.product === productId ? { ...i, quantity: i.quantity + 1 } : i)
          : [...cart, { ...item, quantity: 1 }];
        if (isLoggedInUser) {
          cartService.addToCart(productId, 1).then(c => setItems(c.items || [])).catch(() => {});
        }
        return updated;
      });
      return prev.filter(i => i.product !== productId);
    });
  }, [isLoggedInUser]);

  const removeSaved = useCallback((productId: string) => {
    setSavedItems(prev => prev.filter(i => i.product !== productId));
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, loading, addItem, removeItem, updateQuantity, clearCart, savedItems, saveForLater, moveToCart, removeSaved }}>
      {children}
    </CartContext.Provider>
  );
};
