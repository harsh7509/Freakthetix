// components/AddToCartButton.tsx
"use client";

import { useState } from "react";
// ⬇️ अपने प्रोजेक्ट के अनुसार path सही करें
import { useCart } from "@/lib/cart-context";

type Props = {
  product: any;
  sizes?: string[];
  colors?: string[];
};

export function AddToCartButton({ product, sizes = [], colors = [] }: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState<number>(1);
  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [color, setColor] = useState<string | undefined>(colors[0]);

  // --- Normalize product so cart में सही डेटा जाए ---
  const normalizedProduct = {
    ...product,
    id: product._id ?? product.id ?? product.slug,               // fallback id
    price: Number(product.price) || 0,                           // number ensure
    images: Array.isArray(product.images)
      ? product.images
      : product.image
      ? [product.image]
      : [],
  };

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(99, q + 1));

  // ✅ cart-context सिग्नेचर के हिसाब से
  const handleAdd = () => {
    addItem(normalizedProduct, qty, size, color);
  };

  const handleBuyNow = () => {
    addItem(normalizedProduct, qty, size, color);
    window.location.href = "/checkout";
  };

  return (
    <div className="mt-6 space-y-4">
      {!!sizes.length && (
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full bg-transparent border border-white/20 rounded px-3 py-2"
        >
          {sizes.map((s) => (
            <option className="bg-black" key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {!!colors.length && (
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full bg-transparent border border-white/20 rounded px-3 py-2"
        >
          {colors.map((c) => (
            <option className="bg-black" key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center justify-between md:justify-start gap-4 border border-white/30 rounded-full px-3 py-2 w-full md:w-auto">
          <button onClick={dec} className="w-10 h-10 rounded-full border border-white/30">−</button>
          <span className="min-w-[2ch] text-center">{qty}</span>
          <button onClick={inc} className="w-10 h-10 rounded-full border border-white/30">+</button>
        </div>

        <button
          onClick={handleAdd}
          className="flex-1 md:flex-none md:w-56 h-12 rounded-full bg-white text-black font-semibold tracking-wide hover:bg-gray-200 transition"
        >
          ADD TO CART
        </button>

        <button
          onClick={handleBuyNow}
          className="flex-1 md:flex-none md:w-56 h-12 rounded-full border border-white/40 text-white font-semibold tracking-wide hover:bg-white/10 transition"
        >
          BUY IT NOW
        </button>
      </div>
    </div>
  );
}
