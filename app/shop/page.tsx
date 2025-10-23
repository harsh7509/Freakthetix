"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";

type Product = {
  _id: string; name: string; slug: string; price: number; images?: string[]; colors?: string[]; sizes?: string[];
};

export default function ShopPage() {
  const [all, setAll] = useState<Product[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/products", { cache: "no-store" });
      const json = await res.json();
      setAll(json || []);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter(p => p.name.toLowerCase().includes(s) || p.slug.includes(s));
  }, [q, all]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Shop</h1>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search products…"
          className="bg-white/10 border border-white/10 px-3 py-2 rounded-md w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
