import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import ProductModel from '@/lib/models/Product';
import { isValidObjectId } from 'mongoose';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const p = await ProductModel.findById(id).lean();
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt?.toISOString?.() ?? '',
    updatedAt: p.updatedAt?.toISOString?.() ?? '',
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const body = await req.json();
  if (body.slug) body.slug = body.slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const updated = await ProductModel.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  await ProductModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
