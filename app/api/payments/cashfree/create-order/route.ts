import { NextRequest, NextResponse } from 'next/server';

const ENV = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
const CF_BASE = ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

function missingEnv() {
  return !process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY;
}

export async function POST(req: NextRequest) {
  try {
    if (missingEnv()) {
      return NextResponse.json(
        { ok: false, reason: 'cashfree_not_configured' },
        { status: 200 }
      );
    }

    const { orderId, amount, customer } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'orderId and amount are required' },
        { status: 400 }
      );
    }

    // MUST be alphanumeric/_/-
    const safeCustomerId =
      (customer?.email?.replace(/[^a-zA-Z0-9_-]/g, '_')) || `user_${Date.now()}`;

    const base = process.env.SITE_URL || 'http://localhost:3000';

    const payload = {
      order_id: `FTX_${orderId}`,          // CF’s required field name
      order_amount: Number(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: safeCustomerId,
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
        'x-api-version': '2025-01-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    // Surface Cashfree’s status & message so you can see the real reason.
    if (!res.ok) {
      return NextResponse.json(
        { error: json?.message || json?.error || 'Cashfree error', details: json },
        { status: res.status }
      );
    }

    // Prefer hosted link if present; otherwise return session id
     // Cashfree PG /orders successful response → payment_session_id
    const paymentSessionId = json?.payment_session_id ?? null;
    // कुछ accounts में link नहीं आता; अगर चाहिए तो /pg/links वाला अलग route बनाइए
    const paymentLink = json?.payment_link ?? null;

    return NextResponse.json(
      { ok: true, paymentLink, paymentSessionId, raw: json },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Payment error' },
      { status: 500 }
    );
  }
}

// Optional: lets you GET the route in the browser and not see 405
export async function GET() {
  return NextResponse.json({ ok: true, route: '/api/payments/cashfree/create-order' });
}
