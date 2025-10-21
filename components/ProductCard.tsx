'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/supabase';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isHovered && product.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev === product.images.length - 1 ? 0 : prev + 1
        );
      }, 800);
    } else {
      setCurrentImageIndex(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, product.images.length]);

  const hasImages = product.images && product.images.length > 0;

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div
        className="relative aspect-square bg-white/5 overflow-hidden mb-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasImages ? (
          <Image
            src={product.images[currentImageIndex]}
            alt={product.name}
            fill
            className="object-cover transition-opacity duration-300"
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
        <p className="text-sm text-gray-400">${product.price.toFixed(2)}</p>
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-2">
            {product.colors.slice(0, 4).map((color, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
