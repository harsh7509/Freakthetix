"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images?: string[];
  alt: string;
};

const FALLBACK = "https://via.placeholder.com/800x1000?text=No+Image";

export default function ProductGallery({ images = [], alt }: Props) {
  const pics = images.length ? images : [FALLBACK];
  const [index, setIndex] = useState(0);

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-white/5">
        <Image
          key={pics[index]}               // forces swap smoothly
          src={pics[index]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {pics.length > 1 && (
        <div className="mt-3 grid grid-cols-5 md:grid-cols-6 gap-2">
          {pics.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative aspect-square overflow-hidden rounded-lg bg-white/5 ring-2 transition
                ${i === index ? "ring-white" : "ring-transparent hover:ring-white/40"}`}
              aria-label={`Show image ${i + 1}`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
