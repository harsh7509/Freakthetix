'use client';

import { useState } from 'react';

type AccordionItem =
  | {
      id: string;
      title: string;
      type: 'text';
      value: string;
    }
  | {
      id: string;
      title: string;
      type: 'list';
      value: string[];
    }
  | {
      id: string;
      title: string;
      type: 'faq';
      value: { shipping: string; returns: string };
    };

export default function ProductAccordion({
  items,
}: {
  items: AccordionItem[];
}) {
  const [openId, setOpenId] = useState<string | null>(
    items[0]?.id ?? null
  );

  return (
    <div className="divide-y divide-white/10 border border-white/10">
      {items.map((item) => (
        <div key={item.id}>
          <button
            className="w-full text-left flex justify-between items-center px-4 py-3 hover:bg-white/5"
            onClick={() =>
              setOpenId(openId === item.id ? null : item.id)
            }
          >
            <span className="font-semibold">
              {item.title}
            </span>
            <span className="text-sm text-gray-400">
              {openId === item.id ? '−' : '+'}
            </span>
          </button>

          {openId === item.id && (
            <div className="px-4 pb-4 text-sm text-gray-300">
              {item.type === 'text' && (
                <p className="leading-relaxed whitespace-pre-line">
                  {item.value}
                </p>
              )}

              {item.type === 'list' && Array.isArray(item.value) && (
                <ul className="list-disc pl-5 space-y-1">
                  {item.value.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}

              {item.type === 'faq' && (
                <div className="space-y-3">
                  <p>
                    <span className="font-semibold">
                      {item.value.shipping.split(':')[0]}:
                    </span>{' '}
                    {item.value.shipping
                      .split(':')
                      .slice(1)
                      .join(':')
                      .trim()}
                  </p>
                  <p>
                    <span className="font-semibold">
                      {item.value.returns.split(':')[0]}:
                    </span>{' '}
                    {item.value.returns
                      .split(':')
                      .slice(1)
                      .join(':')
                      .trim()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
