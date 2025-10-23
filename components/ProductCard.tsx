'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductLite } from '@/lib/types'; // 👈 use the lite type

export default function ProductCard({ product }: { product: ProductLite }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const imgCount = product.images?.length ?? 0;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isHovered && imgCount > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev === imgCount - 1 ? 0 : prev + 1));
      }, 800);
    } else {
      setCurrentImageIndex(0);
    }
    return () => interval && clearInterval(interval);
  }, [isHovered, imgCount]);

  const src = product.images?.[currentImageIndex];

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div
        className="relative aspect-square bg-white/5 overflow-hidden mb-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {src ? (
          <Image
            src={src}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20">
            No Image
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-medium group-hover:text-gray-300 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-400">₹ {product.price.toFixed(2)}</p>
        {!!product.colors?.length && (
          <div className="flex gap-2">
            {product.colors.slice(0, 4).map((color, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
