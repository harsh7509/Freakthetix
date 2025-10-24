// app/products/[slug]/ProductClient.tsx
'use client';

import ProductAccordion from '@/components/ProductAccordion';
import ProductGallery from '@/components/ProductGallery';
import { AddToCartButton } from '@/components/AddToCartButton';

type ProductClientProps = {
  product: {
    _id: string;
    name: string;
    price: number;
    description: string;
    sizes: string[];
    colors: string[];
    images: string[];
    product_details: any; // string | string[] | object | null
  };
};

export default function ProductClient({
  product,
}: ProductClientProps) {
  // turn product_details into bullet points
  const raw = product.product_details;
  let details: string[] = [];

  if (Array.isArray(raw)) {
    details = raw.filter(Boolean).map(String);
  } else if (typeof raw === 'string') {
    details = raw
      .split(/[\n,•·\-]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (raw && typeof raw === 'object') {
    details = Object.values(raw)
      .map((v) => String(v).trim())
      .filter(Boolean);
  }

  if (!details.length) {
    details = [
      'Premium cotton blend',
      'Athletic fit',
      'Machine-wash cold',
    ];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* LEFT: gallery */}
      <ProductGallery
        images={product.images}
        alt={product.name}
      />

      {/* RIGHT: info / add to cart / accordion */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider uppercase">
          {product.name}
        </h1>

        <div className="mt-2 text-xl md:text-2xl font-bold tracking-wide">
          ₹ {product.price.toFixed(2)}
        </div>

        <div className="my-6 h-px bg-white/10" />

        <ProductAccordion
          items={[
            {
              id: 'desc',
              title: 'Read Description',
              // ✅ now we're passing plain strings, not React nodes
              type: 'text',
              value:
                product.description ||
                'Our goal is for every customer to be totally satisfied with their purchase. If this isn’t the case, let us know and we’ll do our best to make it right.',
            },
            {
              id: 'detail',
              title: 'Product Detail',
              type: 'list',
              value: details, // array<string>
            },
            {
              id: 'faqs',
              title: 'FAQs',
              type: 'faq',
              value: {
                shipping:
                  'Shipping: Calculated at checkout.',
                returns:
                  'Returns: 7-day easy returns on unused items.',
              },
            },
          ]}
        />

        <AddToCartButton
          product={product as any}
          sizes={product.sizes ?? []}
          colors={product.colors ?? []}
        />
      </div>
    </div>
  );
}
