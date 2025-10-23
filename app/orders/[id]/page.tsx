// app/orders/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Not found');
        setOrder(data);
      } catch (err) {
        console.error('Order load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        Loading order…
      </div>
    );

  if (!order)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold mb-2">Order not found</h1>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Order Confirmation</h1>

      <div className="border border-white/10 p-6 rounded-lg bg-white/5 mb-6">
        <h2 className="text-xl font-semibold mb-2">Order ID</h2>
        <p className="text-gray-300 break-all">{order._id}</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Status</h2>
        <p
          className={`inline-block px-3 py-1 rounded ${
            order.status === 'pending'
              ? 'bg-yellow-500/20 text-yellow-300'
              : order.status === 'paid'
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'
          }`}
        >
          {order.status}
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Amount</h2>
        <p className="text-gray-300 text-lg">₹ {order.amount}</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Payment</h2>
        <p className="text-gray-300">{order?.meta?.paymentMethod || '—'}</p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Items</h2>
      <div className="space-y-3">
        {order.items?.map((i: any, idx: number) => (
          <div key={idx} className="flex justify-between border border-white/10 p-3 rounded">
            <div>
              <div className="font-medium">{i.name}</div>
              <div className="text-gray-400 text-sm">
                Qty: {i.qty} × ₹{i.price}
              </div>
            </div>
            <div>₹ {(i.qty * i.price).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
