"use client";

import { useState } from "react";

type Item = { id: string; title: string; content: React.ReactNode };

export default function ProductAccordion({ items }: { items: Item[] }) {
  const [openId, setOpenId] = useState<string | null>(items?.[0]?.id ?? null);

  return (
    <div className="divide-y divide-white/10 border-t border-b border-white/10">
      {items.map((it) => {
        const open = openId === it.id;
        return (
          <div key={it.id}>
            <button
              className="w-full flex items-center justify-between py-4 text-left"
              onClick={() => setOpenId(open ? null : it.id)}
            >
              <span className="font-semibold tracking-wide uppercase">{it.title}</span>
              <span className={`transition ${open ? "rotate-45" : ""}`}>+</span>
            </button>
            <div
              className={`overflow-hidden transition-[max-height] duration-300 ${
                open ? "max-h-[500px] pb-5" : "max-h-0"
              }`}
            >
              <div className="text-sm text-white/80 leading-relaxed">{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
