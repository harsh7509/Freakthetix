// app/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";

// 👉 Replace these with your own images
const IMG = {
  hero:
    "https://t4.ftcdn.net/jpg/14/51/73/45/360_F_1451734549_2a6WkPNBrAHikeex60PonwMDbLqQXrLb.jpg",
  banner1:
    "https://m.media-amazon.com/images/I/51uot7WdDUL.jpg",
  banner2:
    "https://allofficials.in/cdn/shop/files/Nylon_Compression_T-Shirt_Full_Sleeve_Dark-Matter_right.jpg?v=1759944716&width=533",
  col1:
    "https://m.media-amazon.com/images/I/61UYSaBkUnL.jpg",
  col2:
    "https://m.media-amazon.com/images/I/61IEOOezjSL.jpg",
  col3:
    "https://m.media-amazon.com/images/I/51hQQm3pKdL.jpg",
};

async function getProducts() {
  // shows a small grid lower on the page
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/products`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen">
      {/* ====== NAV is already in layout ====== */}

      {/* ====== HERO ====== */}
      <section className="relative h-[70vh] md:h-[85vh] w-full border-b border-white/10">
        <Image
          src={IMG.hero}
          alt="Freakthetix hero"
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/70" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="tracking-[0.35em] text-xs md:text-sm text-gray-300">
            UNLEASH . DEFINE . AESTHETIX
          </p>
          <h1 className="mt-6 text-5xl md:text-7xl font-extrabold">
            FREAKTHETIX
          </h1>
          <Link
            href="/shop"
            className="mt-8 inline-block bg-white text-black px-5 py-2 text-sm font-semibold tracking-wide hover:bg-gray-200"
          >
            ENTER THE LAIR
          </Link>
        </div>
      </section>

      {/* ====== FEATURE BANNER 1 (image left, text right) ====== */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="relative aspect-[4/3] md:col-span-7 bg-white/5">
          <Image src={IMG.banner1} alt="Compression Tee" fill className="object-cover" sizes="(max-width: 768px) 100vw, 55vw" />
        </div>
        <div className="md:col-span-5 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">COMPRESSION</h2>
          <p className="text-gray-300 mt-3">
            Built to grind. Premium stretch fabric, locked-in fit.
          </p>
          <Link
            href="/shop"
            className="mt-6 bg-white text-black w-max px-4 py-2 font-semibold hover:bg-gray-200"
          >
            SHOP NOW
          </Link>
        </div>
      </section>

      {/* ====== FEATURE BANNER 2 (text left, image right) ====== */}
      <section className="max-w-6xl mx-auto px-4 py-6 md:py-2 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 order-2 md:order-1 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">DESIGNED COMPRESSION</h2>
          <p className="text-gray-300 mt-3">
            Graphic detail. Aggressive silhouette. Statement performance.
          </p>
          <Link
            href="/shop"
            className="mt-6 bg-white text-black w-max px-4 py-2 font-semibold hover:bg-gray-200"
          >
            SHOP NOW
          </Link>
        </div>
        <div className="relative aspect-[4/3] md:col-span-7 order-1 md:order-2 bg-white/5">
          <Image src={IMG.banner2} alt="Designed Compression" fill className="object-cover" sizes="(max-width: 768px) 100vw, 55vw"
 />
        </div>
      </section>

      {/* ====== HEADLINE TAGLINE ====== */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[11px] md:text-xs leading-6 tracking-widest text-gray-300">
          LIFT, BLEED, CONQUER THE WEIGHT.
          <br />
          TURN YOUR GRIND INTO YOUR FATE.
          <br />
          EVERY SET A WARRIOR&apos;S FIX,
          <br />
          CLAIM THE CROWN WITH FREAKTHETIX.
        </p>
        <Link href="/shop" className="inline-block mt-4 underline text-gray-300 hover:text-white">
          Shop now →
        </Link>
      </section>

      {/* ====== SHOP BY COLLECTION ====== */}
      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="mb-6">
          <h3 className="inline-block bg-white/10 px-4 py-2 text-3xl md:text-4xl font-extrabold tracking-wider">
            SHOP BY COLLECTION
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/shop?collection=logos" className="group relative overflow-hidden border border-white/10">
            <div className="relative aspect-[4/5] bg-white/5">
              <Image src={IMG.col1} alt="Logos" fill className="object-cover group-hover:scale-105 transition" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 text-sm">
              LOGO TEES
            </div>
          </Link>

          <Link href="/shop?collection=sandos" className="group relative overflow-hidden border border-white/10">
            <div className="relative aspect-[4/5] bg-white/5">
              <Image src={IMG.col2} alt="Sandos" fill className="object-cover group-hover:scale-105 transition" />
            </div>
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 text-sm">
              SANDOS
            </div>
          </Link>

          <Link href="/shop?collection=compression" className="group relative overflow-hidden border border-white/10">
            <div className="relative aspect-[4/5] bg-white/5">
              <Image src={IMG.col3} alt="Compression" fill className="object-cover group-hover:scale-105 transition" />
            </div>
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 text-sm">
              COMPRESSION
            </div>
          </Link>
        </div>
      </section>

      {/* ====== PRODUCT TEASER GRID ====== */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold mb-6">Latest Drops</h3>
        {products.length === 0 ? (
          <p className="text-gray-400">No products yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((p: any) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
