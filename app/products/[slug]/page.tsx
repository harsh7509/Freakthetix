// app/products/[slug]/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import ProductClient from './ProductClient';

async function getProduct(slug: string) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const res = await fetch(`${base}/api/products/slug/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        <h1 className="text-2xl font-semibold mb-3">
          Product not found
        </h1>
      </div>
    );
  }

  // Normalize data into a plain serializable shape
  const images: string[] =
    Array.isArray(product.images) && product.images.length
      ? product.images
      : [
          'https://via.placeholder.com/800x1000?text=No+Image',
        ];

  const normalizedProduct = {
    _id: String(product._id ?? ''),
    name: product.name ?? '',
    price: Number(product.price ?? 0),
    description: product.description ?? '',
    sizes: Array.isArray(product.sizes)
      ? product.sizes
      : [],
    colors: Array.isArray(product.colors)
      ? product.colors
      : [],
    images,
    product_details: product.product_details ?? null,
  };

  return (
    <ProductClient product={normalizedProduct} />
  );
}
