import ProductAccordion from "@/components/ProductAccordion";
import ProductGallery from "@/components/ProductGallery";
import { AddToCartButton } from "@/components/AddToCartButton";

async function getProduct(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/products/slug/${slug}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        <h1 className="text-2xl font-semibold mb-3">Product not found</h1>
      </div>
    );
  }

  // images + details normalization
  const images: string[] =
    Array.isArray(product.images) && product.images.length
      ? product.images
      : ["https://via.placeholder.com/800x1000?text=No+Image"];

  const raw = product.product_details;
  let details: string[] = [];
  if (Array.isArray(raw)) details = raw.filter(Boolean).map(String);
  else if (typeof raw === "string")
    details = raw.split(/[\n,•·\-]+/g).map((s) => s.trim()).filter(Boolean);
  else if (raw && typeof raw === "object")
    details = Object.values(raw).map((v) => String(v).trim()).filter(Boolean);
  if (!details.length) details = ["Premium cotton blend", "Athletic fit", "Machine-wash cold"];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* LEFT */}
      <ProductGallery images={images} alt={product.name} />

      {/* RIGHT */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider uppercase">
          {product.name}
        </h1>
        <div className="mt-2 text-xl md:text-2xl font-bold tracking-wide">
          ₹ {Number(product.price).toFixed(2)}
        </div>

        <div className="my-6 h-px bg-white/10" />

        <ProductAccordion
          items={[
            {
              id: "desc",
              title: "Read Description",
              content:
                product.description ||
                "Our goal is for every customer to be totally satisfied with their purchase. If this isn’t the case, let us know and we’ll do our best to make it right.",
            },
            {
              id: "detail",
              title: "Product Detail",
              content: (
                <ul className="list-disc pl-5 space-y-1">
                  {details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              ),
            },
            {
              id: "faqs",
              title: "FAQs",
              content: (
                <div>
                  <p className="mb-2">
                    <span className="font-semibold">Shipping:</span> Calculated at checkout.
                  </p>
                  <p>
                    <span className="font-semibold">Returns:</span> 7-day easy returns on unused
                    items.
                  </p>
                </div>
              ),
            },
          ]}
        />

        <AddToCartButton
          product={product}
          sizes={product.sizes ?? []}
          colors={product.colors ?? []}
        />
      </div>
    </div>
  );
}
