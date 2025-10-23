'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/lib/store/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const N = (v: any) => Number(v ?? 0) || 0;
const firstImage = (p: any) => (Array.isArray(p?.images) && p.images[0]) || p?.image || undefined;

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
});

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, clear } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const redirected = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (status === 'unauthenticated' && !redirected.current) {
      redirected.current = true;
      router.replace('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  const normalized = useMemo(() => {
    return (items ?? []).map((it: any) => {
      const p = it.product ?? {};
      const id = it.productId ?? p._id ?? p.id ?? p.slug ?? p.name ?? 'x';
      const name = it.name ?? p.name ?? 'Item';
      const price = N(it.price ?? p.price);
      const qty = N(it.quantity ?? it.qty);
      return { id, name, price, qty, img: it.image ?? firstImage(p), raw: it };
    });
  }, [items]);

  const subtotal = useMemo(() => normalized.reduce((s, i) => s + N(i.price) * N(i.qty), 0), [normalized]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!normalized.length) {
      toast({ title: 'Cart empty', description: 'Please add items first.' });
      return;
    }

    const fd = new FormData(e.currentTarget);
    const addr = {
      fullName: String(fd.get('fullName') || ''),
      phone: String(fd.get('phone') || ''),
      line1: String(fd.get('line1') || ''),
      line2: String(fd.get('line2') || ''),
      city: String(fd.get('city') || ''),
      state: String(fd.get('state') || ''),
      pincode: String(fd.get('pincode') || ''),
    };

    const parsed = addressSchema.safeParse(addr);
    if (!parsed.success) {
      toast({ title: 'Invalid address', description: parsed.error.issues[0]?.message || 'Fix address fields' });
      return;
    }

    try {
      setPlacing(true);

      // 1) Create internal order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: normalized.map((i) => ({
            productId: i.raw?.productId ?? i.raw?.product?._id ?? i.id,
            name: i.name,
            price: i.price,
            qty: i.qty,
            size: i.raw?.size ?? i.raw?.selectedSize,
            color: i.raw?.color ?? i.raw?.selectedColor,
          })),
          amount: subtotal,
          address: addr,
          paymentMethod: 'online_or_cod',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Order create failed');

      // 2) Ask server to create Cashfree order
      const payRes = await fetch('/api/payments/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: json.orderId,
          amount: subtotal,
          customer: {
            email: session?.user?.email,
            name: session?.user?.name,
            phone: addr.phone,
          },
        }),
      });
      const payJson = await payRes.json();
      // console.log('Cashfree create:', payRes.status, payJson);

      if (payRes.ok && payJson?.paymentLink) {
        clear();
        window.location.href = payJson.paymentLink; // hosted redirect
        return;
      }

      // Fallback: COD
      toast({ title: 'Payment link unavailable', description: 'Order placed as COD fallback.' });
      clear();
      router.replace(`/orders/${json.orderId}`);
    } catch (err: any) {
      toast({ title: 'Checkout failed', description: err?.message || 'Try again' });
    } finally {
      setPlacing(false);
    }
  }

  const loadingOrUnauthed = !mounted || status === 'loading' || status === 'unauthenticated';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {loadingOrUnauthed ? (
        <div className="min-h-[60vh] grid place-items-center">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div><Label>Full name</Label><Input name="fullName" required /></div>
              <div><Label>Phone</Label><Input name="phone" required /></div>
              <div><Label>Address line 1</Label><Input name="line1" required /></div>
              <div><Label>Address line 2</Label><Input name="line2" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><Label>City</Label><Input name="city" required /></div>
                <div><Label>State</Label><Input name="state" required /></div>
                <div><Label>Pincode</Label><Input name="pincode" required /></div>
              </div>
              <Button disabled={placing} className="w-full bg-white text-black hover:bg-gray-200">
                {placing ? 'Placing order…' : 'Place order'}
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {normalized.map((i) => (
                <div key={i.id} className="flex items-center justify-between border border-white/10 p-3 rounded">
                  <div className="flex items-center gap-3">
                    {i.img && <img src={i.img} alt="" className="w-16 h-16 object-cover rounded" />}
                    <div>
                      <div className="font-medium">{i.name}</div>
                      <div className="text-sm text-gray-400">Qty: {i.qty}</div>
                    </div>
                  </div>
                  <div>₹ {(N(i.price) * N(i.qty)).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-white/10 mt-4 pt-4">
              <div className="font-semibold">Subtotal</div>
              <div className="font-semibold">₹ {subtotal.toFixed(2)}</div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Taxes & shipping calculated at payment (if online).</p>
          </div>
        </div>
      )}
    </div>
  );
}
