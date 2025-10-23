'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const { items, totalPrice, removeItem, clearCart } = useCart();

  // 👇 avoid SSR/client mismatch by waiting for mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // SSR & first client paint show the same placeholder -> no mismatch
  if (!mounted) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        Loading cart…
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
        <Link href="/shop" className="underline text-gray-300 hover:text-white">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <ul className="space-y-4">
        {items.map((item, i) => {
          const p = item.product;
          const img = p.images?.[0];
          return (
            <li key={i} className="border border-white/10 p-4 flex gap-4">
              <div className="relative w-24 h-32 bg-white/5">
                {img ? (
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    className="object-cover"
                    // 👇 sizes required when using `fill`
                    sizes="96px"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-white/30">No Image</div>
                )}
              </div>

              <div className="flex-1">
                <Link href={`/products/${p.slug}`} className="font-medium hover:underline">
                  {p.name}
                </Link>
                <div className="text-gray-400 text-sm">Qty: {item.quantity}</div>
                {item.size && <div className="text-gray-400 text-sm">Size: {item.size}</div>}
                {item.color && <div className="text-gray-400 text-sm">Color: {item.color}</div>}
              </div>

              <div className="text-right">
                <div className="font-semibold">₹ {(p.price * item.quantity).toFixed(2)}</div>
                <button
                  onClick={() =>
                    removeItem(p._id ?? p.id ?? p.slug ?? p.name, item.size, item.color)
                  }
                  className="text-sm text-red-400 mt-2 hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between mt-8">
        <div className="text-xl font-semibold">Total: ₹ {totalPrice.toFixed(2)}</div>
        <div className="flex gap-3">
          <button onClick={clearCart} className="px-4 py-2 border border-white/20">Clear Cart</button>
          <Link href="/checkout" className="px-4 py-2 bg-white text-black hover:bg-gray-200">Checkout</Link>
        </div>
      </div>
    </div>
  );
}
