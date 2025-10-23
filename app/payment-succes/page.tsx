'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Cashfree may append query params like order_id/order_token/status
  useEffect(() => {
    // optionally: you can poll your DB to confirm status == 'paid'
    // (webhook already marks order as paid; this is just UX)
  }, []);

  const orderId = String(searchParams?.order_id || '');
  const status = String(searchParams?.order_status || '');

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Payment {status?.toUpperCase() || 'Success'}</h1>
      <p className="text-gray-400 mb-6">
        {orderId ? `Order ID: ${orderId}` : 'Thank you for your purchase!'}
      </p>
      <Link href="/shop" className="underline hover:text-white">
        Continue shopping
      </Link>
    </div>
  );
}
