'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { Product } from './types';

// ---------------- TYPES ----------------
export type CartItem = {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (p: Product, q: number, s?: string, c?: string) => void;
  removeItem: (id: string, s?: string, c?: string) => void;
  updateQuantity: (id: string, q: number, s?: string, c?: string) => void;
  clearCart: () => void;

  // aliases
  remove: CartContextType['removeItem'];
  updateQty: CartContextType['updateQuantity'];
  clear: CartContextType['clearCart'];

  totalItems: number;
  totalPrice: number;
  subtotal: number;

  /** true once we've read localStorage on the client */
  ready: boolean;
};

// ---------------- CONSTANTS ----------------
const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = 'cart';
const num = (v: any) => Number(v ?? 0) || 0;
const pid = (p: Product) => String(p._id ?? (p as any).id ?? p.slug ?? p.name ?? 'x');
const keyOf = (p: Product, s?: string, c?: string) => [pid(p), s ?? '', c ?? ''].join('|');

// ---------------- PROVIDER ----------------
export function CartProvider({ children }: { children: ReactNode }) {
  // Start with an empty array on the server to avoid SSR/client mismatch.
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const lastSnapshot = useRef<string>('[]');

  // Hydrate exactly once after mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: CartItem[] = raw ? JSON.parse(raw) : [];
      const fixed = parsed.map((it) => ({
        ...it,
        product: { ...it.product, price: num((it.product as any).price) },
        quantity: Math.max(1, num(it.quantity)),
      }));
      const snap = JSON.stringify(fixed);
      lastSnapshot.current = snap;
      setItems(fixed);
    } catch {
      // ignore
    } finally {
      setReady(true);
    }
  }, []);

  // Persist only when data actually changes.
  useEffect(() => {
    if (!ready) return;
    try {
      const snap = JSON.stringify(items);
      if (snap !== lastSnapshot.current) {
        localStorage.setItem(STORAGE_KEY, snap);
        lastSnapshot.current = snap;
      }
    } catch {
      // ignore
    }
  }, [items, ready]);

  const addItem: CartContextType['addItem'] = (product, quantity, size, color) => {
    const q = Math.max(1, num(quantity));
    setItems((prev) => {
      const idx = prev.findIndex((i) => keyOf(i.product, i.size, i.color) === keyOf(product, size, color));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + q };
        return next;
      }
      return [
        ...prev,
        {
          product: { ...product, price: num((product as any).price) },
          quantity: q,
          size,
          color,
        },
      ];
    });
  };

  const removeItem: CartContextType['removeItem'] = (id, s, c) => {
    setItems((prev) =>
      prev.filter((i) => keyOf(i.product, i.size, i.color) !== [id, s ?? '', c ?? ''].join('|')),
    );
  };

  const updateQuantity: CartContextType['updateQuantity'] = (id, q, s, c) => {
    const qty = Math.max(0, num(q));
    setItems((prev) =>
      qty === 0
        ? prev.filter((i) => keyOf(i.product, i.size, i.color) !== [id, s ?? '', c ?? ''].join('|'))
        : prev.map((i) =>
            keyOf(i.product, i.size, i.color) === [id, s ?? '', c ?? ''].join('|')
              ? { ...i, quantity: qty }
              : i,
          ),
    );
  };

  const clearCart = () => setItems([]);

  // totals
  const { totalItems, totalPrice } = useMemo(() => {
    return items.reduce(
      (acc, it) => {
        acc.totalItems += num(it.quantity);
        acc.totalPrice += num((it.product as any).price) * num(it.quantity);
        return acc;
      },
      { totalItems: 0, totalPrice: 0 },
    );
  }, [items]);

  const value: CartContextType = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      remove: removeItem,
      updateQty: updateQuantity,
      clear: clearCart,
      totalItems,
      totalPrice,
      subtotal: totalPrice,
      ready,
    }),
    [items, totalItems, totalPrice, ready],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ---------------- HOOK ----------------
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
