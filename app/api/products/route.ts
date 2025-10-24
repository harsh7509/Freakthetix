// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Product from '@/lib/models/Product';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    const data = products.map((p: any) => ({
      ...p,
      _id: String(p._id),
      createdAt: p.createdAt?.toISOString?.() ?? '',
      updatedAt: p.updatedAt?.toISOString?.() ?? '',
    }));
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('/api/products GET error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    if (!body?.name || !body?.price) {
      return NextResponse.json({ error: 'name & price are required' }, { status: 400 });
    }
    if (!body.slug) {
      body.slug = String(body.name).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    const doc = await Product.create(body);
    return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
  } catch (e: any) {
    console.error('/api/products POST error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
