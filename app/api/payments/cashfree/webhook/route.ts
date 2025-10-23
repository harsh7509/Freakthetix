// app/api/payments/cashfree/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/db';
import OrderModel from '@/lib/models/Order';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifySignature(rawBody: string, signatureB64: string, secret: string) {
  const computedB64 = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  const a = new Uint8Array(Buffer.from(signatureB64 || '', 'base64'));
  const b = new Uint8Array(Buffer.from(computedB64, 'base64'));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const sig = req.headers.get('x-webhook-signature') || '';
    const secret = process.env.CASHFREE_WEBHOOK_SECRET || '';
    if (!secret) return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });

    const ok = verifySignature(raw, sig, secret);
    if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

    let event: any = {};
    try {
      event = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const paymentStatus = event?.data?.payment?.payment_status; // SUCCESS/FAILED
    const cfOrderId = event?.data?.order?.cf_order_id;

    await dbConnect();

    if (paymentStatus === 'SUCCESS') {
      await OrderModel.findOneAndUpdate(
        { cf_order_id: cfOrderId },
        { status: 'paid', meta: event },
        { new: true }
      );
    } else if (paymentStatus === 'FAILED') {
      await OrderModel.findOneAndUpdate(
        { cf_order_id: cfOrderId },
        { status: 'failed', meta: event },
        { new: true }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Webhook error' }, { status: 500 });
  }
}
