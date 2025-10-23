// app/api/payments/cashfree/debug/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env: process.env.CASHFREE_ENV,
    hasAppId: Boolean(process.env.CASHFREE_APP_ID),
    hasSecret: Boolean(process.env.CASHFREE_SECRET_KEY),
    appIdTail: String(process.env.CASHFREE_APP_ID || '').slice(-4),
    secretTail: String(process.env.CASHFREE_SECRET_KEY || '').slice(-4),
    base: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  });
}
