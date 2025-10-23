// app/api/payments/cashfree/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import OrderModel from '@/lib/models/Order';

const CF_BASE =
  process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

function assertEnv() {
  if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  try {
    if (!assertEnv()) {
      // Keep this 200 so checkout can gracefully fall back to COD.
      return NextResponse.json({ ok: false, reason: 'cashfree_not_configured' }, { status: 200 });
    }

    const { orderId, amount, customer } = await req.json();
    if (!orderId || !amount) {
      return NextResponse.json({ error: 'orderId/amount required' }, { status: 400 });
    }

    // Base URL for post-payment return
    const base =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3000';

    // Cashfree constraints: alphanumeric + _ -
    const customerId =
      customer?.email?.replace(/[^a-zA-Z0-9_-]/g, '_') || `user_${Date.now()}`;

    // 1) Create order at Cashfree (hosted checkout)
    const payload = {
      order_id: `FTX_${orderId}`,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_email: customer?.email || 'noemail@example.com',
        customer_phone: customer?.phone || '9999999999',
        customer_name: customer?.name || 'Customer',
      },
      order_meta: {
        return_url: `${base}/orders/${orderId}?cf_order_id=FTX_${orderId}`,
      },
    };

    const res = await fetch(`${CF_BASE}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID!,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      // Common cause: wrong key/env mismatch
      return NextResponse.json(
        { error: json?.message || 'Cashfree error', details: json },
        { status: res.status }
      );
    }

    // 2) Store Cashfree order id on our Order document (non-blocking)
    try {
      await dbConnect();
      await OrderModel.findByIdAndUpdate(orderId, {
        cf_order_id: json?.order_id || `FTX_${orderId}`,
        meta: { ...(json || {}) },
      });
    } catch {}

    // 3) Hosted payment link provided by Cashfree
    //    Do NOT construct your own /pg/orders/... URL (it 401s in browser).
    const paymentLink =
      json?.payment_link ||
      json?.order_meta?.payment_link ||
      json?.data?.payment_link ||
      null;

    const paymentSessionId =
      json?.payment_session_id ||
      json?.data?.payment_session_id ||
      null;

    return NextResponse.json(
      { ok: true, paymentLink, paymentSessionId },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Payment error' }, { status: 500 });
  }
}
