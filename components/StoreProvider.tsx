"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";

const CART_KEY = "cart";
const WISHLIST_KEY = "wishlist";

function load<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); state still lives in memory.
  }
}

type Store = {
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  addToCart: (slug: string, options: string, qty: number) => void;
  changeQty: (index: number, delta: number) => void;
  removeLine: (index: number) => void;
  toggleWish: (slug: string) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setCart(load<CartLine>(CART_KEY));
    setWishlist(load<string>(WISHLIST_KEY));
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setCart(load<CartLine>(CART_KEY));
      if (e.key === WISHLIST_KEY) setWishlist(load<string>(WISHLIST_KEY));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateCart = useCallback((fn: (c: CartLine[]) => CartLine[]) => {
    setCart((prev) => {
      const next = fn(prev);
      save(CART_KEY, next);
      return next;
    });
  }, []);

  const addToCart = useCallback(
    (slug: string, options: string, qty: number) =>
      updateCart((prev) => {
        const n = Math.max(1, Math.floor(qty) || 1);
        const i = prev.findIndex((l) => l.slug === slug && l.options === options);
        if (i === -1) return [...prev, { slug, options, qty: n }];
        return prev.map((l, j) => (j === i ? { ...l, qty: l.qty + n } : l));
      }),
    [updateCart],
  );

  const changeQty = useCallback(
    (index: number, delta: number) =>
      updateCart((prev) =>
        prev.map((l, j) => (j === index ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0),
      ),
    [updateCart],
  );

  const removeLine = useCallback(
    (index: number) => updateCart((prev) => prev.filter((_, j) => j !== index)),
    [updateCart],
  );

  const toggleWish = useCallback((slug: string) => {
    setWishlist((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      save(WISHLIST_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<Store>(
    () => ({
      cart,
      wishlist,
      cartCount: cart.reduce((a, l) => a + l.qty, 0),
      addToCart,
      changeQty,
      removeLine,
      toggleWish,
    }),
    [cart, wishlist, addToCart, changeQty, removeLine, toggleWish],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}
