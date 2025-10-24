import { NextRequest, NextResponse } from 'next/server';

const ENV = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
const CF_BASE = ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

function need(k: string) {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
}

export async function POST(req: NextRequest) {
  try {
    const APP = need('CASHFREE_APP_ID');
    const SEC = need('CASHFREE_SECRET_KEY');

    const { orderId, amount, customer } = await req.json();
    if (!orderId || !amount) {
      return NextResponse.json({ error: 'orderId and amount are required' }, { status: 400 });
    }

    const base =
      process.env.SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const safeCustomerId =
      (customer?.email?.replace(/[^a-zA-Z0-9_-]/g, '_')) || `user_${Date.now()}`;

    const payload = {
      order_id: `FTX_${orderId}`,                   // unique/alnum/_/-
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

    const r = await fetch(`${CF_BASE}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': APP,
        'x-client-secret': SEC,
        'x-api-version': '2025-01-01', // newer, stable
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!r.ok) {
      return NextResponse.json(
        { error: j?.message || j?.error || 'Cashfree error', details: j },
        { status: r.status }
      );
    }

    // ---- robust extract (Cashfree कभी-कभी अलग shape देता है) ----
    const paymentSessionId =
      j?.payment_session_id ??
      j?.data?.payment_session_id ??
      j?.order_token ?? // rare legacy
      null;

    const paymentLink =
      j?.payment_link ??
      j?.order_meta?.payment_link ??
      j?.data?.payment_link ??
      j?.link_url ?? // अगर आपने /pg/links का flow लगा दिया हो
      null;

    return NextResponse.json({ ok: true, paymentSessionId, paymentLink, raw: j }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Payment error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
